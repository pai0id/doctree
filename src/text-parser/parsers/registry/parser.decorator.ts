import { ParserRegistry } from "./parser.registry";

export function RegisterParser(fileType: string): ClassDecorator {
	return function (target: any) {
		ParserRegistry.registerParser(fileType, target);
	};
}
