import { IsString, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateNodeTitleRequest {
	@IsUUID("4")
	@ApiProperty({
		example: "8fe5f2c8-d5ed-4077-bb9a-322cd67a3a0f",
		description: "Node id",
	})
	id: string;

	@IsString()
	@ApiProperty({
		example: "Node-title",
		description: "Node title",
	})
	title: string;
}
