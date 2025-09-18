import { IsUUID } from "class-validator";

export class EnqueueFileRequest {
	@IsUUID("4")
	fileId: string;
}
