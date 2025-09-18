import { Injectable } from "@nestjs/common";
import { Parser } from "../parser.interface";

@Injectable()
export class ParserRegistry {
	private static parsers: Map<string, new () => Parser> = new Map();
	private instances: Map<string, Parser> = new Map();

	static registerParser(fileType: string, parser: new () => Parser): void {
		this.parsers.set(fileType, parser);
	}

	constructor() {
		ParserRegistry.parsers.forEach((parser, fileType) => {
			this.instances.set(fileType, new parser());
		});
	}

	getParser(fileType: string): Parser | null {
		return this.instances.get(fileType) || null;
	}

	getSupportedFileTypes(): string[] {
		return Array.from(this.instances.keys());
	}
}
