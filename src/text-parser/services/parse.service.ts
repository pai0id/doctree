import { Injectable } from "@nestjs/common";
import { ParserRegistry } from "../parsers/registry/parser.registry";
import { UploadFileService } from "../../file/services/upload.service";
import { ParseFileRequest } from "./requests/parse.request";
import { ParseFileResponse } from "./responses/parse.response";
import { Logger } from "@nestjs/common";
import { fileTypeFromBuffer } from "file-type";
import { NoParserFoundError, FileNotFoundError } from "./errors.service";

@Injectable()
export class ParseService {
	private readonly logger = new Logger(ParseService.name);

	constructor(
		private readonly parserRegistry: ParserRegistry,
		private readonly fileService: UploadFileService,
	) {}

	async parseFile(req: ParseFileRequest): Promise<ParseFileResponse> {
		const file = await this.fileService.downloadFile(req.fileId);
		if (file === null) {
			throw new FileNotFoundError(req.fileId);
		}

		let mimeType = await fileTypeFromBuffer(file.file);
		if (mimeType === undefined) {
			this.logger.warn(
				`Failed to determine MIME type of file with ID ${req.fileId}, using text/plain`,
			);
			mimeType = { mime: "text/plain", ext: "txt" };
		}

		const parser = this.parserRegistry.getParser(mimeType.mime);
		if (parser === null) {
			throw new NoParserFoundError(mimeType.mime);
		}

		const parsedObj = await parser.parse(file.file);

		return {
			fileId: file.id,
			text: parsedObj.text,
			mimeType: mimeType.mime,
			parsePercentage: parsedObj.parsePercentage,
			parseComment: parsedObj.parseComment,
		};
	}
}
