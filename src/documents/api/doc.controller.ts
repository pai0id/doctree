import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Put,
	Delete,
	Query,
	UseGuards,
	UsePipes,
	ValidationPipe,
	UploadedFile,
	UseInterceptors,
	ParseUUIDPipe,
} from "@nestjs/common";
import { DocumentService } from "../services/doc.service";
import { DocumentCreateRequest } from "../services/requests/doc.create";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileValidationPipe } from "../../file/pipes/validate.pipe";
import {
	AttachDocumentToNodeRequest,
	DetachDocumentFromNodeRequest,
	DocumentUnlinkFileRequest,
	RelateDocumentsRequest,
	UnrelateDocumentsRequest,
} from "../services/requests/doc.link";
import {
	ApiOperation,
	ApiResponse,
	ApiBody,
	ApiConsumes,
	ApiParam,
	ApiQuery,
} from "@nestjs/swagger";
import { DocumentUpdateRequest } from "../services/requests/doc.update";
import { DocumentSearchRequest } from "../services/requests/doc.search";

@Controller("docs")
export class DocumentController {
	constructor(private documentService: DocumentService) {}

	@Post()
	@UsePipes(new ValidationPipe())
	@ApiOperation({ summary: "Create a new document" })
	@ApiResponse({ status: 201, description: "Document successfully created" })
	@ApiResponse({ status: 400, description: "Bad request" })
	@ApiBody({ type: DocumentCreateRequest })
	async createDocument(@Body() req: DocumentCreateRequest) {
		await this.documentService.createDocument(req);
	}

	@Get("search")
	@UsePipes(new ValidationPipe())
	@ApiOperation({ summary: "Search documents" })
	@ApiResponse({ status: 200, description: "Documents found" })
	@ApiResponse({ status: 400, description: "Bad request" })
	async searchDocuments(@Query() query: DocumentSearchRequest) {
		return this.documentService.searchDocuments(query);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get document by id" })
	@ApiResponse({ status: 200, description: "Document found" })
	@ApiResponse({ status: 404, description: "Document not found (WIP)" })
	@ApiResponse({ status: 400, description: "Bad request (WIP)" })
	@ApiParam({ name: "id", type: String, description: "Document id" })
	async getDocument(
		@Param("id", new ParseUUIDPipe({ version: "4" })) docId: string,
	) {
		return this.documentService.getDocument(docId);
	}

	@Get("node/:id")
	@ApiOperation({ summary: "Get node with its documents" })
	@ApiResponse({ status: 200, description: "Node found" })
	@ApiResponse({ status: 404, description: "Node not found (WIP)" })
	@ApiResponse({ status: 400, description: "Bad request (WIP)" })
	@ApiParam({ name: "id", type: String, description: "Node id" })
	async getNodeWithDocuments(
		@Param("id", new ParseUUIDPipe({ version: "4" })) nodeId: string,
	) {
		return this.documentService.getNodeWithDocuments(nodeId);
	}

	@Post(":id/link")
	@UseInterceptors(FileInterceptor("file"))
	@ApiOperation({ summary: "Link file to document" })
	@ApiResponse({ status: 201, description: "File linked to document" })
	@ApiResponse({ status: 404, description: "Document not found (WIP)" })
	@ApiResponse({ status: 400, description: "Bad request" })
	@ApiParam({ name: "id", type: String, description: "Document id" })
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		description: "File to upload",
		schema: {
			type: "object",
			properties: {
				file: {
					type: "string",
					format: "binary",
					description: "The file to upload",
				},
			},
			required: ["file"],
		},
	})
	async linkFile(
		@Param("id", new ParseUUIDPipe({ version: "4" })) docId: string,
		@UploadedFile(FileValidationPipe) file: Express.Multer.File,
	) {
		await this.documentService.linkFile({
			documentId: docId,
			file: {
				filename: file.originalname,
				buffer: file.buffer,
				size: file.size,
			},
		});
	}

	@Post("attach")
	@UsePipes(new ValidationPipe())
	@ApiOperation({ summary: "Attach document to node" })
	@ApiResponse({ status: 201, description: "Document attached to node" })
	@ApiResponse({ status: 404, description: "Document/Node not found" })
	@ApiResponse({ status: 400, description: "Bad request" })
	@ApiBody({ type: AttachDocumentToNodeRequest })
	async attachDocumentToNode(@Body() req: AttachDocumentToNodeRequest) {
		await this.documentService.attachDocumentToNode(req);
	}

	@Put("detach")
	@UsePipes(new ValidationPipe())
	@ApiOperation({ summary: "Detach document from node" })
	@ApiResponse({ status: 200, description: "Document detached from node" })
	@ApiResponse({ status: 404, description: "Document/Node not found" })
	@ApiResponse({ status: 400, description: "Bad request" })
	@ApiBody({ type: DetachDocumentFromNodeRequest })
	async detachDocumentFromNode(@Body() req: DetachDocumentFromNodeRequest) {
		await this.documentService.detachDocumentFromNode(req);
	}

	@Put("unlink")
	@UsePipes(new ValidationPipe())
	@ApiOperation({ summary: "Unlink file from document" })
	@ApiResponse({ status: 200, description: "File unlinked from document" })
	@ApiResponse({ status: 404, description: "Document/File not found" })
	@ApiResponse({ status: 400, description: "Bad request" })
	@ApiBody({ type: DocumentUnlinkFileRequest })
	async unlinkFile(@Body() req: DocumentUnlinkFileRequest) {
		await this.documentService.unlinkFile(req);
	}

	@Put("/info/:id")
	@UsePipes(new ValidationPipe())
	@ApiOperation({ summary: "Update document" })
	@ApiResponse({ status: 200, description: "Document updated" })
	@ApiResponse({ status: 404, description: "Document/File not found" })
	@ApiResponse({ status: 400, description: "Bad request" })
	@ApiParam({ name: "id", type: String, description: "Document id" })
	@ApiBody({ type: DocumentUpdateRequest })
	async updateDocument(
		@Param("id", new ParseUUIDPipe({ version: "4" })) docId: string,
		@Body() req: DocumentUpdateRequest,
	) {
		await this.documentService.updateDocument(docId, req);
	}

	@Delete(":id")
	@UsePipes(new ValidationPipe())
	@ApiOperation({ summary: "Delete document" })
	@ApiResponse({ status: 200, description: "Document deleted" })
	@ApiResponse({ status: 404, description: "Document not found (WIP)" })
	@ApiResponse({ status: 400, description: "Bad request (WIP)" })
	@ApiParam({ name: "id", type: String, description: "Document id" })
	async deleteDocument(
		@Param("id", new ParseUUIDPipe({ version: "4" })) docId: string,
	) {
		await this.documentService.deleteDocument(docId);
	}

	@Post("/relate")
	@UsePipes(new ValidationPipe())
	@ApiOperation({ summary: "Setup relation between documents" })
	@ApiResponse({ status: 201, description: "Documents related" })
	@ApiResponse({ status: 404, description: "Document not found" })
	@ApiResponse({ status: 400, description: "Bad request" })
	@ApiBody({ type: RelateDocumentsRequest })
	async relateDocuments(@Body() req: RelateDocumentsRequest) {
		await this.documentService.relateDocuments(req);
	}

	@Put("/unrelate")
	@UsePipes(new ValidationPipe())
	@ApiOperation({ summary: "Remove relation between documents" })
	@ApiResponse({ status: 200, description: "Documents unrelated" })
	@ApiResponse({ status: 404, description: "Document not found" })
	@ApiResponse({ status: 400, description: "Bad request" })
	@ApiBody({ type: UnrelateDocumentsRequest })
	async unrelateDocuments(@Body() req: UnrelateDocumentsRequest) {
		await this.documentService.unrelateDocuments(req);
	}
}
