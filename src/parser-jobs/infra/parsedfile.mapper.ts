import { ParsedFileEntity } from "./parsedfile.entity";
import { ParseFileResponse } from "../../text-parser/services/responses/parse.response";

export class ParsedFileMapper {
	static toEntity(file: ParseFileResponse): ParsedFileEntity {
		return {
			fileId: file.fileId,
			text: file.text,
			parsedPercentage: file.parsePercentage,
			parsedComment: file.parseComment === undefined ? null : file.parseComment,
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: null,
		};
	}
}
