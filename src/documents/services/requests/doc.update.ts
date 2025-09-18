import { IsArray, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class DocumentUpdateRequest {
	@IsOptional()
	@IsString()
	@ApiProperty({
		example: "Doc-oc",
		description: "Document title (optional)",
	})
	title?: string;

	@IsOptional()
	@IsString()
	@ApiProperty({
		example: "Doctor octopus",
		description: "Document description (optional)",
	})
	description?: string;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@ApiProperty({
		example: ["doctor", "octopus"],
		examples: [["doctor", "octopus"], []],
		description: "Document tags (optional) - replaces current tags",
	})
	tags?: string[];
}
