import { GetFileResponse } from "../../../file/services/responses/get.file";
import { ApiProperty } from "@nestjs/swagger";

export interface GetDocumentRelationResponse {
	documentId: string;
	type: string;
}

export interface GetDocumentResponse {
	id: string;
	title: string;
	description: string | null;
	tags: string[];
	files: GetFileResponse[];
	relations: GetDocumentRelationResponse[];
}
