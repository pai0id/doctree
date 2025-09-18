import { GetFileResponse } from "../../../file/services/responses/get.file";

export interface NodeDocument {
	id: string;
	title: string;
	description: string | null;
	tags: string[];
	files: GetFileResponse[];
}

export interface GetNodeWithDocumentsResponse {
	nodeTitle: string;
	documents: NodeDocument[];
}
