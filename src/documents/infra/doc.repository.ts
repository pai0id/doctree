import { DataSource, IsNull } from "typeorm";
import { Document } from "../domain/doc.model";
import {
	DocumentEntity,
	DocumentTagEntity,
	ParsedFileEntity,
	DocumentFileEntity,
} from "./doc.entity";
import { DocumentMapper } from "./doc.mapper";
import { Injectable } from "@nestjs/common";
import { NodeEntity } from "./doc.entity";
import { DocumentSearchRequest } from "../services/requests/doc.search";
import { CompositeFilter } from "../../database/filters/composite.filter";
import { TextFilter } from "../../database/filters/text.filter";
import { TextOneToManyFilter } from "../../database/filters/text.otm.filter";
import { TextManyToManyFilter } from "../../database/filters/text.mtm.filter";

@Injectable()
export class DocumentRepository {
	constructor(private dataSource: DataSource) {}

	async createDocument(doc: Document): Promise<void> {
		const repo = this.dataSource.getRepository(DocumentEntity);

		return new Promise((resolve, reject) => {
			repo
				.save(DocumentMapper.toEntity(doc))
				.then((_) => resolve())
				.catch(reject);
		});
	}

	async getDocument(docId: string): Promise<Document | null> {
		const repo = this.dataSource.getRepository(DocumentEntity);

		return repo
			.findOne({
				where: { id: docId },
				relations: ["tags", "documentFiles", "documentNodes", "relations"],
			})
			.then((entity) => (entity ? DocumentMapper.toDomain(entity) : null));
	}

	async getNodeTitle(nodeId: string): Promise<string | null> {
		const repo = this.dataSource.getRepository(NodeEntity);

		return repo
			.findOne({
				where: { id: nodeId },
			})
			.then((entity) => (entity ? entity.title : null));
	}

	async getDocumentsByNodeId(nodeId: string): Promise<Document[]> {
		const repo = this.dataSource.getRepository(DocumentEntity);

		const documentEntities = await repo.find({
			where: {
				documentNodes: {
					nodeId: nodeId,
				},
			},
			relations: ["tags", "documentFiles", "documentNodes", "relations"],
		});

		return documentEntities.map((entity) => DocumentMapper.toDomain(entity));
	}

	async updateDocument(doc: Document): Promise<void> {
		const repo = this.dataSource.getRepository(DocumentEntity);
		const tagRepo = this.dataSource.getRepository(DocumentTagEntity);

		try {
			await tagRepo.delete({ documentId: doc.id });
			const entity = DocumentMapper.toEntity(doc);
			entity.tags?.forEach((tag) => {
				tag.documentId = doc.id;
				tag.document = entity;
			});

			await repo.save(entity);
		} catch (err) {
			throw err;
		}
	}

	async softDeleteDocument(docId: string): Promise<void> {
		const repo = this.dataSource.getRepository(DocumentEntity);

		return new Promise((resolve, reject) => {
			repo
				.createQueryBuilder()
				.softDelete()
				.where("id = :id", { id: docId })
				.execute()
				.then((_) => resolve())
				.catch(reject);
		});
	}

	async searchDocuments(req: DocumentSearchRequest): Promise<Document[]> {
		const repo = this.dataSource.getRepository(DocumentEntity);

		const filter = new CompositeFilter<DocumentEntity>()
			.addFilter(
				new TextFilter<DocumentEntity, DocumentSearchRequest>("title", "title"),
			)
			.addFilter(
				new TextFilter<DocumentEntity, DocumentSearchRequest>(
					"description",
					"description",
				),
			)
			.addFilter(
				new TextOneToManyFilter<
					DocumentEntity,
					DocumentTagEntity,
					DocumentSearchRequest
				>("tag", "tag", "id", "documentId", DocumentTagEntity),
			)
			.addFilter(
				new TextManyToManyFilter<
					DocumentEntity,
					ParsedFileEntity,
					DocumentFileEntity,
					DocumentSearchRequest
				>(
					"text",
					"text",
					"id",
					"documentId",
					"fileId",
					"fileId",
					ParsedFileEntity,
					DocumentFileEntity,
				),
			);

		filter.parse(req);

		const query = repo.createQueryBuilder();

		filter.apply(query);

		const entities = await query.getMany();

		return entities.map((entity) => DocumentMapper.toDomain(entity));
	}
}
