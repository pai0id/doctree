import {
	Controller,
	UsePipes,
	ValidationPipe,
	Get,
	Param,
	HttpException,
	HttpStatus,
} from "@nestjs/common";
import { ParseService } from "../services/parse.service";
import { ParseFileRequest } from "../services/requests/parse.request";
import { ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { ParseFileResponse } from "../services/responses/parse.response";
import {
	NoParserFoundError,
	FileNotFoundError,
} from "../services/errors.service";

@Controller("parse")
export class ParseController {
	constructor(private readonly parseService: ParseService) {}

	@Get(":fileId")
	@UsePipes(new ValidationPipe())
	@ApiOperation({ summary: "Parse file text by id" })
	@ApiParam({ name: "fileId", type: String, description: "File id" })
	@ApiResponse({
		status: 200,
		description: "File parsed",
		type: ParseFileResponse,
	})
	@ApiResponse({ status: 404, description: "File not found" })
	@ApiResponse({ status: 415, description: "Unsupported MIME type" })
	async parseFile(@Param() req: ParseFileRequest) {
		try {
			return await this.parseService.parseFile(req);
		} catch (err) {
			switch (err.constructor) {
				case NoParserFoundError:
					throw new HttpException(
						err.message,
						HttpStatus.UNSUPPORTED_MEDIA_TYPE,
					);
				case FileNotFoundError:
					throw new HttpException(err.message, HttpStatus.NOT_FOUND);
				default:
					throw err;
			}
		}
	}
}
