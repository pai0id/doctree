import { Injectable } from "@nestjs/common";
import { DocumentRepository } from "../infra/doc.repository";
import { DocumentCreateRequest } from "./requests/doc.create";
import { Document } from "../domain/doc.model";
import { GetFileResponse } from "../../file/services/responses/get.file";
import { GetDocumentResponse } from "./responses/doc.get";
import { UploadFileService } from "../../file/services/upload.service";
import { TreeService } from "../../tree/services/tree.service";
import { Tree } from "../../tree/domain/tree.model";
import { GetFileResponseFromDomain } from "../../file/services/responses/get.file";
import { ConfigService } from "@nestjs/config";
import { GetNodeWithDocumentsResponse } from "./responses/node.doc.get";
import {
	AttachDocumentToNodeRequest,
	DetachDocumentFromNodeRequest,
	DocumentFileLinkRequest,
	DocumentUnlinkFileRequest,
	RelateDocumentsRequest,
	UnrelateDocumentsRequest,
} from "./requests/doc.link";
import { formatDate } from "../../utils/date";
import { DocumentUpdateRequest } from "./requests/doc.update";
import { DocumentSearchRequest } from "./requests/doc.search";
import { ConflictException, NotFoundException } from "../../errors/errors";

@Injectable()
export class DocumentService {
	private readonly bucketName;
	private static readonly dateFormat = "dd-MM-yyyyTHH:mm:ss";
	constructor(
		private documentRepository: DocumentRepository,
		private fileService: UploadFileService,
		private configService: ConfigService,
		private treeService: TreeService,
	) {
		this.bucketName = this.configService.getOrThrow("MINIO_BUCKET_NAME");
	}

	async createDocument(req: DocumentCreateRequest): Promise<void> {
		const doc = new Document(
			req.title,
			req.description !== undefined ? req.description : null,
			req.tags,
			[],
			[],
			[],
		);
		return this.documentRepository.createDocument(doc);
	}

	async getDocument(docId: string): Promise<GetDocumentResponse | null> {
		return this.documentRepository.getDocument(docId).then((doc) => {
			if (doc === null) {
				throw new NotFoundException("Document not found");
			}
			return doc
				.fillFiles((fileId) => this.fileService.getFileInfo(fileId))
				.then((_) => {
					return {
						id: doc.id,
						title: doc.title,
						description: doc.description,
						tags: doc.tags,
						files: doc.files!.map((fileInfo) =>
							GetFileResponseFromDomain(fileInfo),
						),
						relations: doc.relations.map((relation) => {
							return {
								documentId: relation.documentId,
								type: relation.type,
							};
						}),
					};
				});
		});
	}

	async getNodeWithDocuments(
		nodeId: string,
	): Promise<GetNodeWithDocumentsResponse | null> {
		const nodeTitle = await this.documentRepository.getNodeTitle(nodeId);
		if (!nodeTitle) {
			throw new NotFoundException("Node not found");
		}

		const documents =
			await this.documentRepository.getDocumentsByNodeId(nodeId);

		const documentResponses = await Promise.all(
			documents.map(async (doc) => {
				if (doc.fillFiles) {
					await doc.fillFiles((fileId) => this.fileService.getFileInfo(fileId));
				}

				return {
					id: doc.id,
					title: doc.title,
					description: doc.description,
					tags: doc.tags,
					createdAt: doc.createdAt,
					updatedAt: doc.updatedAt,
					files:
						doc.files?.map((fileInfo) => GetFileResponseFromDomain(fileInfo)) ||
						[],
				};
			}),
		);

		return {
			nodeTitle: nodeTitle,
			documents: documentResponses,
		};
	}

	async linkFile(req: DocumentFileLinkRequest): Promise<void> {
		const doc = await this.documentRepository.getDocument(req.documentId);

		if (!doc) {
			throw new NotFoundException("Document not found");
		}

		const fileNameWithTimestamp = req.file.filename.replace(
			/(\.[^.]*)$/,
			`_${formatDate(DocumentService.dateFormat, new Date())}$1`,
		);

		const fileInfo = await this.fileService.uploadFile({
			filebucket: this.bucketName,
			file: {
				filename: fileNameWithTimestamp,
				buffer: req.file.buffer,
				size: req.file.size,
			},
			filedir: doc.id,
		});

		doc.addFileId(fileInfo.id);
		await this.documentRepository.updateDocument(doc);
	}

	async attachDocumentToNode(req: AttachDocumentToNodeRequest): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.documentRepository
				.getDocument(req.documentId)
				.then((doc) => {
					if (doc === null) {
						throw new NotFoundException("Document not found");
					}
					// get the tree to which the document will be attached
					this.treeService
						.getRootTree(req.nodeId)
						.then((rootTree) => {
							// check if the document is already attached to the node
							let node: Tree | null = rootTree.find((node) =>
								doc.nodeIds.includes(node.id),
							);
							// if the document is already attached to the node, and we don't want to move it, reject
							if (node !== null && !req.move) {
								reject(
									new ConflictException("Document already attached to node"),
								);
							}
							// both attached and not attached, it we want to move it, we need to detach it from the old nodes
							// for now it must be only attached to one node, but still we do cycle check, just in case
							while (node !== null) {
								doc?.detachFromNode(node.id);
								node = rootTree.find((node) => doc.nodeIds.includes(node.id));
							}
							// attach the document to the node
							doc?.attachToNode(req.nodeId);
							this.documentRepository
								.updateDocument(doc)
								.then(resolve)
								.catch(reject);
						})
						.catch(reject);
				})
				.catch(reject);
		});
	}

	async detachDocumentFromNode(
		req: DetachDocumentFromNodeRequest,
	): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.documentRepository
				.getDocument(req.documentId)
				.then((doc) => {
					if (doc === null) {
						throw new NotFoundException("Document not found");
					}
					if (!doc.nodeIds.includes(req.nodeId)) {
						reject(new ConflictException("Document not attached to node"));
					}
					doc.detachFromNode(req.nodeId);
					this.documentRepository
						.updateDocument(doc)
						.then(resolve)
						.catch(reject);
				})
				.catch(reject);
		});
	}

	async unlinkFile(req: DocumentUnlinkFileRequest): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.documentRepository
				.getDocument(req.documentId)
				.then((doc) => {
					if (doc === null) {
						throw new NotFoundException("Document not found");
					}
					if (!doc.fileIds.includes(req.fileId)) {
						reject(new ConflictException("File not attached to document"));
					}
					doc.removeFileId(req.fileId);
					this.documentRepository
						.updateDocument(doc)
						.then((_) => {
							this.fileService
								.deleteFile(req.fileId)
								.then(resolve)
								.catch(reject);
						})
						.catch(reject);
				})
				.catch(reject);
		});
	}

	async updateDocument(
		docId: string,
		req: DocumentUpdateRequest,
	): Promise<void> {
		return this.documentRepository.getDocument(docId).then((doc) => {
			if (doc === null) {
				throw new NotFoundException("Document not found");
			}

			if (req.title !== undefined) {
				doc.title = req.title;
			}
			if (req.description !== undefined) {
				doc.description = req.description;
			}
			if (req.tags !== undefined) {
				doc.tags = req.tags;
			}

			this.documentRepository.updateDocument(doc).then();
		});
	}

	async deleteDocument(docId: string): Promise<void> {
		return this.documentRepository.softDeleteDocument(docId);
	}

	async relateDocuments(req: RelateDocumentsRequest): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			const doc1Promise = this.documentRepository.getDocument(req.documentId0);
			const doc2Promise = this.documentRepository.getDocument(req.documentId1);
			return Promise.all([doc1Promise, doc2Promise])
				.then((docs) => {
					if (docs[0] === null) {
						throw new NotFoundException("Document not found");
					}
					if (docs[1] === null) {
						throw new NotFoundException("Document not found");
					}
					const doc0: Document = docs[0];
					const doc1: Document = docs[1];
					if (doc0.id === doc1.id) {
						reject(new ConflictException("Can't relate to self"));
					}

					doc0.relateTo(doc1, req.relation);
					this.documentRepository
						.updateDocument(doc0)
						.then(resolve)
						.catch(reject);
				})
				.catch(reject);
		});
	}

	async unrelateDocuments(req: UnrelateDocumentsRequest): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			const doc0Promise = this.documentRepository.getDocument(req.documentId0);
			const doc1Promise = this.documentRepository.getDocument(req.documentId1);
			return Promise.all([doc0Promise, doc1Promise])
				.then((docs) => {
					if (docs[0] === null) {
						throw new NotFoundException("Document not found");
					}
					if (docs[1] === null) {
						throw new NotFoundException("Document not found");
					}
					const doc0: Document = docs[0];
					const doc1: Document = docs[1];
					if (doc0.id === doc1.id) {
						reject(new ConflictException("Can't relate to self"));
					}

					doc0.unrelateFrom(doc1, req.relation);
					this.documentRepository
						.updateDocument(doc0)
						.then(resolve)
						.catch(reject);
				})
				.catch(reject);
		});
	}

	public searchDocuments(query: DocumentSearchRequest): Promise<Document[]> {
		return new Promise((resolve, reject) => {
			this.documentRepository
				.searchDocuments(query)
				.then(resolve)
				.catch(reject);
		});
	}
}
