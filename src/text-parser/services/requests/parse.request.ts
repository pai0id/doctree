import { IsUUID } from "class-validator";

export class ParseFileRequest {
	@IsUUID("4")
	fileId: string;
}
