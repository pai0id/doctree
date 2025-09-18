import { BufferedFile } from "src/file/domain/bufferedfile.domain";
import { Document, DocumentRelation } from "../domain/doc.model";
import { DocumentCreateRequest } from "../services/requests/doc.create";
import { DocumentFileLinkRequest } from "../services/requests/doc.link";
import { GetDocumentResponse } from "../services/responses/doc.get";

export class DocumentBuilder {
    private id: string = "d74db389-8a59-4382-a7c5-025e1d1f0aa1";
    private title: string = "Test Title";
    private description: string = "Test Description";
    private tags: string[] = ["tag1", "tag2"];
    private fileIds: string[] = [];
    private nodeIds: string[] = [];
    private relations: DocumentRelation[] = [];

    public withTitle(title: string): DocumentBuilder {
        this.title = title;
        return this;
    }

    public withDescription(description: string): DocumentBuilder {
        this.description = description;
        return this;
    }

    public withTags(tags: string[]): DocumentBuilder {
        this.tags = tags;
        return this;
    }

    public withFileIds(fileIds: string[]): DocumentBuilder {
        this.fileIds = fileIds;
        return this;
    }

    public withNodeIds(nodeIds: string[]): DocumentBuilder {
        this.nodeIds = nodeIds;
        return this;
    }

    public withRelations(relations: DocumentRelation[]): DocumentBuilder {
        this.relations = relations;
        return this;
    }

    static aDocument(): DocumentBuilder {
        return new DocumentBuilder();
    }

    public build(): Document {
        const doc = new Document(
            this.title,
            this.description,
            this.tags,
            this.fileIds,
            this.nodeIds,
            this.relations,
        );
        doc.id = this.id;
        return doc;
    }

    public buildGetResponse(): GetDocumentResponse {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            tags: this.tags,
            files: [],
            relations: [],
        };
    }

    public buildCreateRequest(): DocumentCreateRequest {
        return {
            title: this.title,
            description: this.description,
            tags: this.tags,
        };
    }

    public buildLinkFileRequest(): DocumentFileLinkRequest {
        const file: BufferedFile = {
            filename: "Filename",
            buffer: Buffer.alloc(1),
            size: 1,
        };
        return {
            documentId: this.id,
            file: file,
        };
    }
}