import { Logger } from "@nestjs/common";
import { glob } from "glob";
import * as path from "path";

// JS for after translation
const parserGlobTemplate = "**/*.parser.js";

export class ParserLoader {
	static readonly logger = new Logger(ParserLoader.name);

	static async loadParsers(dirname: string): Promise<void> {
		this.logger.log("Loading parsers...");
		this.logger.log(`Looking for parsers in ${dirname}`);
		const parserFiles = await glob(parserGlobTemplate, {
			cwd: dirname,
		});

		for (const file of parserFiles) {
			this.logger.log(`Loading parser ${file}`);
			const modulePath = path.join(dirname, file);
			await import(modulePath);
			this.logger.log(`Loaded parser ${file}`);
		}
	}
}
