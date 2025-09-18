import { Injectable } from "@nestjs/common";
import { RegisterParser } from "../registry/parser.decorator";
import { Parser, ParserResponse } from "../parser.interface";
import { fromBuffer } from "yauzl";
import { Doc } from "./doc";

class UnzippedFile {
	name: string;
	data: Buffer;
}

@Injectable()
@RegisterParser(
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
)
export class DocxParser implements Parser {
	private static readonly documentPath = "word/document.xml";
	private static readonly footnotesPath = "word/footnotes.xml";
	private static readonly endnotesPath = "word/endnotes.xml";
	private static readonly filesToUnzip = [
		DocxParser.documentPath,
		DocxParser.footnotesPath,
		DocxParser.endnotesPath,
	];

	async parse(file: Buffer): Promise<ParserResponse> {
		const files = await this._unzip(file, DocxParser.filesToUnzip);
		const filenames = files.map((file) => file.name);

		const footnotesFile = files.find(
			(file) => file.name === DocxParser.footnotesPath,
		);
		const endnotesFile = files.find(
			(file) => file.name === DocxParser.endnotesPath,
		);
		const documentFile = files.find(
			(file) => file.name === DocxParser.documentPath,
		);
		if (!documentFile) {
			return {
				text: "",
				parsePercentage: 0,
				parseComment: "No document found in docx",
			};
		}

		const parsedDocument = await this._parseDocument(
			documentFile.data,
			footnotesFile?.data,
			endnotesFile?.data,
		);
		const parsePercentage = (parsedDocument.length / file.length) * 100;

		return {
			text: parsedDocument,
			parsePercentage: parsePercentage,
			parseComment:
				"Docx file contain a lot of metadata about visual formatting, so percentage text may be low",
		};
	}
	supports(fileType: string): boolean {
		return (
			fileType ===
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document"
		);
	}

	async _unzip(
		file: Buffer,
		filesToUnzip: string[] = [],
	): Promise<UnzippedFile[]> {
		return new Promise((resolve, reject) => {
			const unzippedFiles: UnzippedFile[] = [];
			const zip = new fromBuffer(
				file,
				{ lazyEntries: true },
				(err, zipfile) => {
					if (err) {
						reject(err);
					}
					zipfile.readEntry();
					zipfile.on("entry", (entry) => {
						if (filesToUnzip.includes(entry.fileName)) {
							zipfile.openReadStream(entry, (err, readStream) => {
								if (err) {
									reject(err);
								}
								const chunks: Array<any> = [];
								readStream.on("data", (chunk) => {
									chunks.push(chunk);
								});
								readStream.on("end", () => {
									const buffer = Buffer.concat(chunks);
									unzippedFiles.push({
										name: entry.fileName,
										data: buffer,
									});
									zipfile.readEntry();
								});
								readStream.on("error", (err) => {
									reject(err);
								});
							});
						} else {
							zipfile.readEntry();
						}
					});
					zipfile.on("end", () => {
						resolve(unzippedFiles);
					});
					zipfile.on("error", (err) => {
						reject(err);
					});
				},
			);
		});
	}

	private static readonly paragraphParserOptions = {
		ignoreAttributes: false,
		attributeNamePrefix: "@_",
		isArray: (name, jpath, isLeafNode, isAttribute) =>
			name === "w:r" || name === "w:p",
	};

	async _parseDocument(
		docFile: Buffer,
		footnotesFile?: Buffer,
		endnotesFile?: Buffer,
	): Promise<string> {
		const doc = new Doc(docFile, footnotesFile, endnotesFile);
		return (await doc.GetParagraphs()).join("\n");
	}
}
