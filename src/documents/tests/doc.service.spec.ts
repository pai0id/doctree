import { DocumentService } from "../services/doc.service";
import { DocumentRepository } from "../infra/doc.repository";
import { Document, DocumentRelationType } from "../domain/doc.model";
import { DocumentCreateRequest } from "../services/requests/doc.create";
import { UploadFileService } from "../../file/services/upload.service";
import { TreeService } from "../../tree/services/tree.service";
import { ConfigService } from "@nestjs/config";
import { NotFoundException } from "@nestjs/common";
import { GetDocumentResponse } from "../services/responses/doc.get";
import { DocumentFactory } from "./doc.factory";
import { AttachDocumentToNodeRequest, DetachDocumentFromNodeRequest, DocumentFileLinkRequest, DocumentUnlinkFileRequest, RelateDocumentsRequest, UnrelateDocumentsRequest } from "../services/requests/doc.link";
import { Tree } from "src/tree/domain/tree.model";
import { DocumentUpdateRequest } from "../services/requests/doc.update";
import { DocumentSearchRequest } from "../services/requests/doc.search";

describe("DocumentService", () => {
	let service: DocumentService;
	let repo: jest.Mocked<DocumentRepository>;
	let file: jest.Mocked<UploadFileService>;
	let conf: jest.Mocked<ConfigService>;
	let tree: jest.Mocked<TreeService>;

	beforeEach(() => {
        repo = {
            getDocument: jest.fn().mockResolvedValue(undefined),
            createDocument: jest.fn().mockResolvedValue(undefined),
            updateDocument: jest.fn().mockResolvedValue(undefined),
            softDeleteDocument: jest.fn().mockResolvedValue(undefined),
            getNodeTitle: jest.fn().mockResolvedValue(undefined),
            getDocumentsByNodeId: jest.fn().mockResolvedValue([]),
            searchDocuments: jest.fn().mockResolvedValue([]),
        } as any;
        
        file = {
            uploadFile: jest.fn().mockResolvedValue({ id: "d0704cc0-adc3-409d-a51e-7d0af765389c", filename: "test.txt" }),
            getFileInfo: jest.fn().mockResolvedValue({ id: "d0704cc0-adc3-409d-a51e-7d0af765389c", filename: "test.txt" }),
            deleteFile: jest.fn().mockResolvedValue(undefined),
        } as any;
        
        conf = {
            getOrThrow: jest.fn().mockReturnValue("minio-bucket"),
        } as any;
        
        tree = {
            getRootTree: jest.fn().mockResolvedValue([]),
        } as any;

        service = new DocumentService(repo, file, conf, tree);
    });

	describe("createDocument", () => {

		it("должен создать документ с обязательными полями", async () => {
			const req: DocumentCreateRequest = DocumentFactory.CreateDocumentRequestWithDescription();

			await service.createDocument(req);

			expect(repo.createDocument).toHaveBeenCalledTimes(1);
			const createdDoc = repo.createDocument.mock.calls[0][0];
			
			expect(createdDoc).toBeInstanceOf(Document);
			expect(createdDoc.title).toBe(req.title);
			expect(createdDoc.description).toBe(req.description);
			expect(createdDoc.tags).toEqual(req.tags);
			expect(createdDoc.description).toBe(req.description);
		});

		it("пробрасывает ошибку, если repository выбрасывает", async () => {
			repo.createDocument.mockRejectedValueOnce(new Error("DB error"));

			const req: DocumentCreateRequest = DocumentFactory.CreateDocumentRequest();

			await expect(service.createDocument(req)).rejects.toThrow("DB error");
		});
	});

	describe("getDocument", () => {
		it("должен выдать документ по id", async () => {
			const doc = DocumentFactory.CreateDefaultDocument();

			const resp: GetDocumentResponse = DocumentFactory.CreateGetDocumentResponse();

			repo.getDocument.mockResolvedValue(doc);

			const docResponse = await service.getDocument(doc.id);

			expect(docResponse?.id).toBe(doc.id);
			expect(docResponse?.title).toBe(doc.title);
			expect(docResponse?.description).toBe(doc.description);
			expect(docResponse?.tags).toEqual(doc.tags);
			expect(docResponse?.files).toEqual([]);
			expect(docResponse?.relations).toEqual([]);
		});

		it("пробрасывает ошибку, если документ не найден", async () => {
			repo.getDocument.mockRejectedValueOnce(new NotFoundException("Document not found"));

			await expect(service.getDocument("d74db389-8a59-4382-a7c5-025e1d1f0aa1")).rejects.toThrow("Document not found");
		});

		it("пробрасывает ошибку, если документ не существует", async () => {
			repo.getDocument.mockRejectedValueOnce(new Error("DB error"));

			await expect(service.getDocument("d74db389-8a59-4382-a7c5-025e1d1f0aa1")).rejects.toThrow("DB error");
		});
	});

	 describe("getNodeWithDocuments", () => {
        it("должен вернуть документы узла", async () => {
            const nodeId = "node-id";
            const nodeTitle = "Test Node";
            const doc = DocumentFactory.CreateDefaultDocument();
            
            repo.getNodeTitle.mockResolvedValue(nodeTitle);
            repo.getDocumentsByNodeId.mockResolvedValue([doc]);

            const result = await service.getNodeWithDocuments(nodeId);

            expect(result).toEqual({
                nodeTitle,
                documents: [expect.objectContaining({
                    id: doc.id,
                    title: doc.title,
                    description: doc.description,
                    tags: doc.tags,
                })]
            });
        });

        it("пробрасывает ошибку, если узел не найден", async () => {
            repo.getNodeTitle.mockResolvedValue(null);

            await expect(service.getNodeWithDocuments("node-id")).rejects.toThrow("Node not found");
        });
    });

	describe("linkFile", () => {
        it("пробрасывает ошибку, если документ не найден", async () => {
            repo.getDocument.mockResolvedValue(null);

            const req: DocumentFileLinkRequest = {
                documentId: "d74db389-8a59-4382-a7c5-025e1d1f0aa1",
                file: {
                    filename: "test.txt",
                    buffer: Buffer.alloc(1),
                    size: 1,
                }
            };

            await expect(service.linkFile(req)).rejects.toThrow("Document not found");
        });
    });

    describe("detachDocumentFromNode", () => {
        it("должен открепить документ от узла", async () => {
            const doc = DocumentFactory.CreateDefaultDocument();
            doc.attachToNode("node-id");
            const req: DetachDocumentFromNodeRequest = {
                documentId: doc.id,
                nodeId: "node-id"
            };

            repo.getDocument.mockResolvedValue(doc);

            await service.detachDocumentFromNode(req);

            expect(repo.updateDocument).toHaveBeenCalled();
        });

        it("пробрасывает ошибку, если документ не прикреплен к узлу", async () => {
            const doc = DocumentFactory.CreateDefaultDocument();
            const req: DetachDocumentFromNodeRequest = {
                documentId: doc.id,
                nodeId: "node-id"
            };

            repo.getDocument.mockResolvedValue(doc);

            await expect(service.detachDocumentFromNode(req)).rejects.toThrow("Document not attached to node");
        });
    });

    describe("unlinkFile", () => {
        it("должен отвязать файл от документа", async () => {
            const doc = DocumentFactory.CreateDefaultDocument();
            doc.addFileId("file-id");
            const req: DocumentUnlinkFileRequest = {
                documentId: doc.id,
                fileId: "file-id"
            };

            repo.getDocument.mockResolvedValue(doc);

            await service.unlinkFile(req);

            expect(file.deleteFile).toHaveBeenCalledWith("file-id");
            expect(repo.updateDocument).toHaveBeenCalled();
        });

        it("пробрасывает ошибку, если файл не привязан к документу", async () => {
            const doc = DocumentFactory.CreateDefaultDocument();
            const req: DocumentUnlinkFileRequest = {
                documentId: doc.id,
                fileId: "file-id"
            };

            repo.getDocument.mockResolvedValue(doc);

            await expect(service.unlinkFile(req)).rejects.toThrow("File not attached to document");
        });
    });

    describe("updateDocument", () => {
        it("должен обновить документ", async () => {
            const doc = DocumentFactory.CreateDefaultDocument();
            const req: DocumentUpdateRequest = {
                title: "Updated Title",
                description: "Updated Description",
                tags: ["updated-tag"]
            };

            repo.getDocument.mockResolvedValue(doc);

            await service.updateDocument(doc.id, req);

            expect(repo.updateDocument).toHaveBeenCalledWith(expect.objectContaining({
                title: "Updated Title",
                description: "Updated Description",
                tags: ["updated-tag"]
            }));
        });

        it("пробрасывает ошибку, если документ не найден при обновлении", async () => {
            repo.getDocument.mockResolvedValue(null);
            const req: DocumentUpdateRequest = { title: "Updated Title" };

            await expect(service.updateDocument("d74db389-8a59-4382-a7c5-025e1d1f0aa1", req)).rejects.toThrow("Document not found");
        });
    });

    describe("deleteDocument", () => {
        it("должен удалить документ", async () => {
            await service.deleteDocument("d74db389-8a59-4382-a7c5-025e1d1f0aa1");
            expect(repo.softDeleteDocument).toHaveBeenCalledWith("d74db389-8a59-4382-a7c5-025e1d1f0aa1");
        });
    });

    describe("relateDocuments", () => {
        it("должен связать документы", async () => {
            const doc1 = DocumentFactory.CreateDefaultDocument();
            const doc2 = DocumentFactory.CreateDefaultDocument();
            doc2.id = "fcdd6ee0-2870-4942-920d-0a7b77752182";
            const req: RelateDocumentsRequest = {
                documentId0: doc1.id,
                documentId1: doc2.id,
                relation: DocumentRelationType.UsedBy
            };

            repo.getDocument.mockImplementation((id) => 
                Promise.resolve(id === doc1.id ? doc1 : doc2)
            );

            await service.relateDocuments(req);

            expect(repo.updateDocument).toHaveBeenCalled();
        });

        it("пробрасывает ошибку при попытке связать документ с самим собой", async () => {
            const doc = DocumentFactory.CreateDefaultDocument();
            const req: RelateDocumentsRequest = {
                documentId0: doc.id,
                documentId1: doc.id,
                relation: DocumentRelationType.UsedBy
            };

            repo.getDocument.mockResolvedValue(doc);

            await expect(service.relateDocuments(req)).rejects.toThrow("Can't relate to self");
        });
    });

    describe("unrelateDocuments", () => {
        it("должен разорвать связь между документами", async () => {
            const doc1 = DocumentFactory.CreateDefaultDocument();
            const doc2 = DocumentFactory.CreateDefaultDocument();
            doc2.id = "fcdd6ee0-2870-4942-920d-0a7b77752182";
            const req: UnrelateDocumentsRequest = {
                documentId0: doc1.id,
                documentId1: doc2.id,
                relation: DocumentRelationType.UsedBy
            };

            repo.getDocument.mockImplementation((id) => 
                Promise.resolve(id === doc1.id ? doc1 : doc2)
            );

            await service.unrelateDocuments(req);

            expect(repo.updateDocument).toHaveBeenCalled();
        });
    });

    describe("searchDocuments", () => {
        it("должен выполнить поиск документов", async () => {
            const query: DocumentSearchRequest = { title: "test" };
            const docs = [DocumentFactory.CreateDefaultDocument()];
            
            repo.searchDocuments.mockResolvedValue(docs);

            const result = await service.searchDocuments(query);

            expect(result).toEqual(docs);
            expect(repo.searchDocuments).toHaveBeenCalledWith(query);
        });
    });
});
