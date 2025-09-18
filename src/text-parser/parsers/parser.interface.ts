import { ParseFileResponse } from "../services/responses/parse.response";
import { Buffer } from "buffer";

export class ParserResponse {
	text: string;

	parsePercentage: number;
	parseComment?: string;
}

export interface Parser {
	parse(file: Buffer): Promise<ParserResponse>;
	supports(fileType: string): boolean;
}
