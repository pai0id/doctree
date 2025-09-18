import { Document, DocumentRelation } from "../domain/doc.model";
import {
	DocumentEntity,
	DocumentTagEntity,
	DocumentFileEntity,
} from "./doc.entity";

export class DocumentMapper {
	static toDomain(entity: DocumentEntity): Document {
		return new Document(
			entity.title,
			entity.description,
			(entity.tags ?? []).map((tag) => tag.tag),
			(entity.documentFiles ?? []).map((file) => file.fileId),
			(entity.documentNodes ?? []).map((node) => node.nodeId),
			(entity.relations ?? []).map(
				(relation) =>
					new DocumentRelation(
						relation.documentId1,
						relation.relation,
						relation.createdAt!,
						relation.updatedAt!,
						relation.deletedAt!,
					),
			),
			entity.id,
			entity.createdAt,
			entity.updatedAt,
			entity.deletedAt,
		);
	}

	static toEntity(document: Document): DocumentEntity {
		const entity = new DocumentEntity();
		entity.title = document.title;
		entity.description = document.description;
		entity.id = document.id;
		entity.createdAt = document.createdAt;
		entity.updatedAt = document.updatedAt;
		entity.deletedAt = document.deletedAt;
		entity.tags = document.tags.map((tag) => {
			return {
				tag: tag,
				document: entity,
				documentId: document.id,
			};
		});
		entity.documentFiles = document.fileIds.map((fileId) => {
			return {
				fileId: fileId,
				document: entity,
				documentId: document.id,
			};
		});

		entity.documentNodes = document.nodeIds.map((nodeId) => {
			return {
				nodeId: nodeId,
				document: entity,
				documentId: document.id,
			};
		});

		entity.relations = document.relations.map((relation) => {
			return {
				documentId0: document.id,
				documentId1: relation.documentId,
				relation: relation.type,
				document0: entity,
				deletedAt: relation.deletedAt,
			};
		});
		return entity;
	}
}
