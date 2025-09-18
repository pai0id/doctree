import {
	IsBoolean,
	IsDefined,
	IsEnum,
	IsString,
	IsUUID,
} from "class-validator";
import { BufferedFile } from "../../../file/domain/bufferedfile.domain";
import { DocumentRelationType } from "../../domain/doc.model";
import { ApiProperty } from "@nestjs/swagger";

export class DocumentFileLinkRequest {
	@IsUUID("4")
	@ApiProperty({
		example: "8fe5f2c8-d5ed-4077-bb9a-322cd67a3a0f",
		description: "Document id",
	})
	documentId: string;

	@IsDefined()
	@ApiProperty({
		description: "File to link",
	})
	file: BufferedFile;
}

export class DocumentUnlinkFileRequest {
	@IsUUID("4")
	@ApiProperty({
		example: "8fe5f2c8-d5ed-4077-bb9a-322cd67a3a0f",
		description: "Document id",
	})
	documentId: string;

	@IsUUID("4")
	@ApiProperty({
		example: "8fe5f2c8-d5ed-4077-bb9a-322cd67a3a0f",
		description: "File id",
	})
	fileId: string;
}

export class AttachDocumentToNodeRequest {
	@IsUUID("4")
	@ApiProperty({
		example: "8fe5f2c8-d5ed-4077-bb9a-322cd67a3a0f",
		description: "Document id",
	})
	documentId: string;

	@IsUUID("4")
	@ApiProperty({
		example: "8fe5f2c8-d5ed-4077-bb9a-322cd67a3a0f",
		description: "Node id",
	})
	nodeId: string;

	@IsBoolean()
	@ApiProperty({
		example: true,
		description:
			"Move document to the node (in case it is currently attached to another node)",
	})
	move: boolean;
}

export class DetachDocumentFromNodeRequest {
	@IsUUID("4")
	@ApiProperty({
		example: "8fe5f2c8-d5ed-4077-bb9a-322cd67a3a0f",
		description: "Document id",
	})
	documentId: string;

	@IsUUID("4")
	@ApiProperty({
		example: "8fe5f2c8-d5ed-4077-bb9a-322cd67a3a0f",
		description: "Node id",
	})
	nodeId: string;
}

export class RelateDocumentsRequest {
	@IsUUID("4")
	@ApiProperty({
		example: "8fe5f2c8-d5ed-4077-bb9a-322cd67a3a0f",
		description: "Document0 id",
	})
	documentId0: string;

	@IsUUID("4")
	@ApiProperty({
		example: "8fe5f2c8-d5ed-4077-bb9a-322cd67a3a0f",
		description: "Document1 id",
	})
	documentId1: string;

	@IsEnum(DocumentRelationType)
	@ApiProperty({
		example: "used_by",
		examples: ["used_by"],
		description: "Relation type",
	})
	relation: DocumentRelationType;
}

export class UnrelateDocumentsRequest {
	@IsUUID("4")
	@ApiProperty({
		example: "8fe5f2c8-d5ed-4077-bb9a-322cd67a3a0f",
		description: "Document0 id",
	})
	documentId0: string;

	@IsUUID("4")
	@ApiProperty({
		example: "8fe5f2c8-d5ed-4077-bb9a-322cd67a3a0f",
		description: "Document1 id",
	})
	documentId1: string;

	@IsEnum(DocumentRelationType)
	@ApiProperty({
		example: "used_by",
		examples: ["used_by"],
		description: "Relation type",
	})
	relation: DocumentRelationType;
}
