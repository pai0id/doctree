import { Injectable } from "@nestjs/common";
import { RegisterParser } from "../registry/parser.decorator";
import { getDocument } from "pdfjs-dist-legacy";
import { TextItem } from "pdfjs-dist/types/src/display/api";
import { Parser, ParserResponse } from "../parser.interface";

@Injectable()
@RegisterParser("application/pdf")
export class PdfParser implements Parser {
	async parse(file: Buffer): Promise<ParserResponse> {
		const doc = await getDocument(file).promise;

		const numPages = doc.numPages;
		let text: string = "";
		const textItemsCount = 0;
		const itemsCount: number = 0;

		let textWeight = 0;
		const documentWeight = file.length;

		for (let i = 1; i <= numPages; i++) {
			const page = await doc.getPage(i);
			const textContent = await page.getTextContent();

			// A question, as it counts text and marked text content. Dunno if this correctly count images, etc.
			// maybe should analyze tree or operators
			// itemsCount += textContent.items.length;

			const arr = Array.from(textContent.items)
				.map((item) => ("str" in item ? item.str.trim() : ""))
				.filter((item) => item.trim().length > 0);

			text += arr.join(" ") + "\n";
		}

		text = text.trim();
		textWeight = text.length;

		return {
			text: text,
			parsePercentage: Math.round((textWeight / documentWeight) * 100),
			parseComment: `Parsed ${textWeight} bytes from ${documentWeight} total document bytes`,
		};
	}

	supports(fileType: string): boolean {
		return fileType === "application/pdf";
	}
}
