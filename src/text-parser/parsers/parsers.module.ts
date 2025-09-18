import { DynamicModule, Module, OnModuleInit } from "@nestjs/common";
import { ParserLoader } from "./registry/parser.loader";
import { ParserRegistry } from "./registry/parser.registry";
import { Logger } from "@nestjs/common";

@Module({})
export class ParsersModule implements OnModuleInit {
	private static readonly logger = new Logger(ParsersModule.name);
	static async forRoot(): Promise<DynamicModule> {
		await ParserLoader.loadParsers(__dirname);

		return {
			module: ParsersModule,
			providers: [ParserRegistry],
			exports: [ParserRegistry],
		};
	}

	constructor(private readonly registry: ParserRegistry) {}

	async onModuleInit() {
		ParsersModule.logger.log(
			`Loaded parser for files: ${this.registry.getSupportedFileTypes().join(", ")}`,
		);
	}
}
