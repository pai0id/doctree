import { Document, DocumentRelation } from "../domain/doc.model";
import { DocumentCreateRequest } from "../services/requests/doc.create";
import { GetDocumentResponse } from "../services/responses/doc.get";
import { DocumentBuilder } from "./doc.builder";

export class DocumentFactory {
    static CreateDefaultDocument(): Document {
        return DocumentBuilder.aDocument().build();
    }

    static CreateDocumentRequest(): DocumentCreateRequest {
        return DocumentBuilder.aDocument().buildCreateRequest();
    }

    static CreateDocumentRequestWithDescription(): DocumentCreateRequest {
        return DocumentBuilder.aDocument()
            .withDescription("Test Description")
            .buildCreateRequest();
    }

    static CreateGetDocumentResponse(): GetDocumentResponse {
        return DocumentBuilder.aDocument().buildGetResponse();
    }
}