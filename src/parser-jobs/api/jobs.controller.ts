import {
	Controller,
	UsePipes,
	ValidationPipe,
	Get,
	Param,
	HttpException,
	HttpStatus,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { ParsingJobManager } from "../services/job.manager";
import { EnqueueFileRequest } from "../services/requests/enqueue.request";

@Controller("parsing")
export class ParsingController {
	constructor(private readonly jobManager: ParsingJobManager) {}

	@Get("enqueue/:fileId")
	@UsePipes(new ValidationPipe())
	@ApiOperation({ summary: "Enqueue file for parsing" })
	@ApiParam({ name: "fileId", type: String, description: "File id" })
	@ApiResponse({ status: 200, description: "File enqueued" })
	async enqueueFile(@Param() req: EnqueueFileRequest) {
		await this.jobManager.enqueue(req.fileId);
	}
}
