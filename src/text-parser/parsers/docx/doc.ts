import { XMLParser } from "fast-xml-parser";
import Stream from "stream";

export class Doc {
	private static attributeNamePrefix = "@_";

	private static readonly paragraphParserOptions = {
		ignoreAttributes: false,
		attributeNamePrefix: Doc.attributeNamePrefix,
		isArray: (name, jpath, isLeafNode, isAttribute) =>
			name === "w:r" || name === "w:p",
	};

	private static readonly footnoteParserOptions = {
		ignoreAttributes: false,
		attributeNamePrefix: Doc.attributeNamePrefix,
		isArray: (name, jpath, isLeafNode, isAttribute) =>
			name === "w:r" || name === "w:p" || name === "w:footnote",
	};

	private static readonly endnoteParserOptions = {
		ignoreAttributes: false,
		attributeNamePrefix: Doc.attributeNamePrefix,
		isArray: (name, jpath, isLeafNode, isAttribute) =>
			name === "w:r" || name === "w:p" || name === "w:endnote",
	};

	static _attribute(name: string): string {
		return `${Doc.attributeNamePrefix}${name}`;
	}

	private docx: any;
	private footnotes?: any;
	private endnotes?: any;

	constructor(
		docBuffer: Buffer,
		footnotesBuffer?: Buffer,
		endnotesBuffer?: Buffer,
	) {
		const xmlParser = new XMLParser(Doc.paragraphParserOptions);
		this.docx = xmlParser.parse(docBuffer);

		if (footnotesBuffer) {
			const footnoteParser = new XMLParser(Doc.footnoteParserOptions);
			this.footnotes = footnoteParser.parse(footnotesBuffer);
		}
		if (endnotesBuffer) {
			const endnoteParser = new XMLParser(Doc.endnoteParserOptions);
			this.endnotes = endnoteParser.parse(endnotesBuffer);
		}
	}

	async GetParagraphs(): Promise<string[]> {
		const result: Promise<string>[] = [];
		this.docx["w:document"]["w:body"]["w:p"].forEach((paragraph: any) => {
			result.push(this._parseParagraph(paragraph));
		});
		return Promise.all(result).then((strings) => strings.flat());
	}

	static async _footnoteFormat(footnoteText: string): Promise<string> {
		return `(Сноска: ${footnoteText})`;
	}

	static async _endnoteFormat(endnoteText: string): Promise<string> {
		return `(Сноска: ${endnoteText})`;
	}

	async _getFootnote(id: number): Promise<string> {
		if (!this.footnotes) {
			throw new Error("Footnotes not found");
		}
		const footnoteObj = this.footnotes["w:footnotes"]["w:footnote"].find(
			(footnote) => footnote[Doc._attribute("w:id")] === `${id}`,
		);
		if (!footnoteObj) {
			throw new Error(`Footnote with id ${id} not found`);
		}

		const footnoteStrings: Promise<string>[] = [];
		footnoteObj["w:p"].forEach((paragraph: any) => {
			footnoteStrings.push(this._parseParagraph(paragraph));
		});

		return Promise.all(footnoteStrings).then((strings) => strings.join("\n"));
	}

	async _getEndnote(id: number): Promise<string> {
		if (!this.endnotes) {
			throw new Error("Endnotes not found");
		}
		const endnoteObj = this.endnotes["w:endnotes"]["w:endnote"].find(
			(endnote) => endnote[Doc._attribute("w:id")] === `${id}`,
		);
		if (!endnoteObj) {
			throw new Error(`Endnote with id ${id} not found`);
		}

		const endnoteStrings: Promise<string>[] = [];
		endnoteObj["w:p"].forEach((paragraph: any) => {
			endnoteStrings.push(this._parseParagraph(paragraph));
		});

		return Promise.all(endnoteStrings).then((strings) => strings.join("\n"));
	}

	async _parseParagraph(paragraph: any): Promise<string> {
		const paragraphStrings: Promise<string>[] = [];
		if (!paragraph["w:r"]) {
			return "";
		}
		paragraph["w:r"].forEach((runObj: any) => {
			// Text block
			if (runObj["w:t"]) {
				paragraphStrings.push(Doc._getText(runObj["w:t"]));
				// Reference of footnote
			} else if (runObj["w:footnoteReference"]) {
				const footnoteId: number = parseInt(
					runObj["w:footnoteReference"][Doc._attribute("w:id")],
				);
				paragraphStrings.push(
					this._getFootnote(footnoteId).then(Doc._footnoteFormat),
				);
				// Reference of endnote
			} else if (runObj["w:endnoteReference"]) {
				const endnoteId: number = parseInt(
					runObj["w:endnoteReference"][Doc._attribute("w:id")],
				);
				paragraphStrings.push(
					this._getEndnote(endnoteId).then(Doc._endnoteFormat),
				);
			}
		});
		return Promise.all(paragraphStrings).then((strings) => strings.join(" "));
	}

	// textObj is a w:t element
	static async _getText(textObj: any): Promise<string> {
		if (typeof textObj === "string") {
			return textObj;
		}
		return textObj["#text"];
	}
}
