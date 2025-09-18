import {
	Controller,
	Get,
	Param,
	UsePipes,
	ValidationPipe,
	Post,
	Body,
	Put,
	BadRequestException,
	Delete,
	ParseUUIDPipe,
} from "@nestjs/common";
import {
	ApiOperation,
	ApiResponse,
	ApiBody,
	ApiConsumes,
	ApiParam,
} from "@nestjs/swagger";
import { TreeService } from "../services/tree.service";
import {
	GetAllTreesResponseDto,
	GetRootTreeResponseDto,
	GetSubTreeResponseDto,
} from "../services/responses/get.response";
import {
	CreateNodeRequest,
	CreateRootRequest,
} from "../services/requests/create.request";
import { UpdateNodeParentRequest } from "../services/requests/update.request";
import { TreeHasCycleError } from "../domain/tree.model";

@Controller("trees")
export class TreeController {
	constructor(private readonly treeService: TreeService) {}

	@Get("sub/:id")
	@UsePipes(new ValidationPipe())
	@ApiOperation({ summary: "Get subtree" })
	@ApiResponse({ status: 200, description: "Subtree found" })
	@ApiResponse({ status: 404, description: "Subtree not found" })
	@ApiResponse({ status: 400, description: "Bad request" })
	@ApiParam({ name: "id", type: String, description: "Node id" })
	async getSubTree(
		@Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
	): Promise<GetSubTreeResponseDto> {
		return await this.treeService.getSubTree(id);
	}

	@Get("root/:id")
	@UsePipes(new ValidationPipe())
	@ApiOperation({ summary: "Get root tree" })
	@ApiResponse({ status: 200, description: "Root tree found" })
	@ApiResponse({ status: 404, description: "Root tree not found" })
	@ApiResponse({ status: 400, description: "Bad request" })
	@ApiParam({ name: "id", type: String, description: "Node id" })
	async getRootTree(
		@Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
	): Promise<GetRootTreeResponseDto> {
		return await this.treeService.getRootTree(id);
	}

	@Get()
	@ApiOperation({ summary: "Get all trees" })
	@ApiResponse({ status: 200, description: "Trees found" })
	async getAllTrees(): Promise<GetAllTreesResponseDto> {
		return await this.treeService.getAllTrees();
	}

	@Post("node")
	@UsePipes(new ValidationPipe())
	@ApiOperation({ summary: "Create node" })
	@ApiResponse({ status: 201, description: "Node created" })
	@ApiResponse({ status: 400, description: "Bad request" })
	@ApiBody({ type: CreateNodeRequest })
	async createNode(@Body() req: CreateNodeRequest) {
		await this.treeService.createNode(req);
	}

	@Post("root")
	@UsePipes(new ValidationPipe())
	@ApiOperation({ summary: "Create root" })
	@ApiResponse({ status: 201, description: "Root created" })
	@ApiResponse({ status: 400, description: "Bad request" })
	@ApiBody({ type: CreateRootRequest })
	async createRoot(@Body() req: CreateRootRequest) {
		await this.treeService.createRoot(req);
	}

	@Put("parent")
	@UsePipes(new ValidationPipe())
	@ApiOperation({ summary: "Update node" })
	@ApiResponse({ status: 200, description: "Node updated" })
	@ApiResponse({ status: 404, description: "Node not found" })
	@ApiResponse({ status: 400, description: "Bad request" })
	@ApiBody({ type: UpdateNodeParentRequest })
	async updateNode(@Body() req: UpdateNodeParentRequest) {
		try {
			await this.treeService.updateNode(req);
		} catch (e) {
			if (e instanceof TreeHasCycleError) {
				throw new BadRequestException(e);
			}
			throw e;
		}
	}

	@Delete("node/:id")
	@UsePipes(new ValidationPipe())
	@ApiOperation({ summary: "Delete node" })
	@ApiResponse({ status: 200, description: "Node deleted" })
	@ApiResponse({ status: 404, description: "Node not found" })
	@ApiResponse({ status: 400, description: "Bad request" })
	@ApiParam({ name: "id", type: String, description: "Node id" })
	async deleteNode(
		@Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
	) {
		await this.treeService.deleteNode(id);
	}

	@Delete("root/:id")
	@UsePipes(new ValidationPipe())
	@ApiOperation({ summary: "Delete root" })
	@ApiResponse({ status: 200, description: "Root deleted" })
	@ApiResponse({ status: 404, description: "Root not found" })
	@ApiResponse({ status: 400, description: "Bad request" })
	@ApiParam({ name: "id", type: String, description: "Node id" })
	async deleteRoot(
		@Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
	) {
		await this.treeService.deleteRoot(id);
	}
}
