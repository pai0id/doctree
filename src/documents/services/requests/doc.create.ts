import { IsArray, IsOptional, IsString, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class DocumentCreateRequest {
	@IsString()
	@ApiProperty({
		example: "Doc-oc",
		description: "Document title",
	})
	title: string;

	@IsOptional()
	@IsString()
	@ApiProperty({
		example: "Doctor octopus",
		description: "Document description (optional)",
	})
	description?: string;

	@IsArray()
	@IsString({ each: true })
	@ApiProperty({
		example: ["doctor", "octopus"],
		examples: [["doctor", "octopus"], []],
		description: "Document tags",
	})
	tags: string[];
}
