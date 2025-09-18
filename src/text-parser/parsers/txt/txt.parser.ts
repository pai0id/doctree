import { Injectable } from "@nestjs/common";
import { RegisterParser } from "../registry/parser.decorator";
import { Parser, ParserResponse } from "../parser.interface";

@Injectable()
@RegisterParser("text/plain")
export class TxtParser implements Parser {
	async parse(file: Buffer): Promise<ParserResponse> {
		return {
			text: file.toString(),
			parsePercentage: 100,
			parseComment: "Just a text file",
		};
	}
	supports(fileType: string): boolean {
		return fileType === "text/plain";
	}
}
