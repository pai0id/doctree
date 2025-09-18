import {
	Controller,
	Get,
	ParseUUIDPipe,
	Body,
	UsePipes,
	ValidationPipe,
	Param,
	Put,
} from "@nestjs/common";
import {
	ApiOperation,
	ApiResponse,
	ApiBody,
	ApiConsumes,
	ApiParam,
} from "@nestjs/swagger";
import { NodeService } from "../services/node.service";
import {
	GetAllNodeResponseDto,
	GetNodeResponseDto,
} from "../services/responses/get.response";
import { UpdateNodeTitleRequest } from "../services/requests/update.request";

@Controller("nodes")
export class NodeController {
	constructor(private readonly nodeService: NodeService) {}

	@Get()
	@ApiOperation({ summary: "Get all nodes" })
	@ApiResponse({ status: 200, description: "Nodes found" })
	async getAllNodes(): Promise<GetAllNodeResponseDto> {
		return await this.nodeService.getAllNodes();
	}

	@Get(":id")
	@UsePipes(new ValidationPipe())
	@ApiOperation({ summary: "Get node by id" })
	@ApiResponse({ status: 200, description: "Node found" })
	@ApiResponse({ status: 404, description: "Node not found" })
	@ApiResponse({ status: 400, description: "Bad request" })
	@ApiParam({ name: "id", type: String, description: "Node id" })
	async getNode(
		@Param("id", new ParseUUIDPipe({ version: "4" })) nodeId: string,
	): Promise<GetNodeResponseDto> {
		return await this.nodeService.getNode(nodeId);
	}

	@Put("title")
	@UsePipes(new ValidationPipe())
	@ApiOperation({ summary: "Update node title" })
	@ApiResponse({ status: 200, description: "Node title updated" })
	@ApiResponse({ status: 404, description: "Node not found" })
	@ApiResponse({ status: 400, description: "Bad request" })
	@ApiBody({ type: UpdateNodeTitleRequest })
	async updateNodeTitle(@Body() req: UpdateNodeTitleRequest): Promise<void> {
		await this.nodeService.updateNodeTitle(req);
	}
}
