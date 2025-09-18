import { ParseFileResponse } from "../../../text-parser/services/responses/parse.response";

export class ParsingJobResponse {
	status: "success" | "error";
	fileId: string;
	response?: ParseFileResponse;
	error?: Error;
}
