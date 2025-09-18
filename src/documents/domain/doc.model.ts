import {
	IsArray,
	IsDate,
	IsEnum,
	IsInstance,
	IsOptional,
	IsString,
	IsUUID,
	ValidateNested,
} from "class-validator";
import { BaseModel } from "../../base/base.model";
import { ValidateObject } from "../../utils/validate.throw";
import { StoredFileInfo } from "../../file/domain/meta.domain";
import { IsBefore } from "../../base/before";

export enum DocumentRelationType {
	UsedBy = "used_by",
}

export class Document extends BaseModel {
	@IsString()
	title: string;

	@IsOptional()
	@IsString()
	description: string | null;

	@IsOptional()
	@IsArray()
	tags: string[];

	@IsArray()
	fileIds: string[];

	@IsOptional()
	@IsArray()
	files?: StoredFileInfo[];

	@IsArray()
	nodeIds: string[];

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	relations: DocumentRelation[];

	constructor(
		title: string,
		description: string | null,
		tags: string[],
		fileIds: string[],
		nodeIds: string[],
		relations: DocumentRelation[],
	);
	constructor(
		title: string,
		description: string | null,
		tags: string[],
		fileIds: string[],
		nodeIds: string[],
		relations: DocumentRelation[],
		id: string,
		createdAt: Date,
		updatedAt: Date,
		deletedAt: Date | null,
	);
	constructor(
		title: string,
		description: string | null,
		tags: string[],
		fileIds: string[],
		nodeIds: string[],
		relations: DocumentRelation[],
		id?: string,
		createdAt?: Date,
		updatedAt?: Date,
		deletedAt?: Date | null,
	) {
		if (arguments.length <= 4) {
			super();
		} else {
			super(id!, createdAt!, updatedAt!, deletedAt!);
		}
		this.title = title;
		this.description = description;
		this.tags = tags;
		this.fileIds = fileIds;
		this.nodeIds = nodeIds;
		this.relations = relations;

		ValidateObject(this);
	}

	fillFiles(
		fileFunc: (fileId: string) => Promise<StoredFileInfo | null>,
	): Promise<void> {
		if (this.files !== undefined) {
			throw new Error("Files already filled");
		}
		this.files = [];
		return Promise.all(
			this.fileIds.map((fileId) =>
				fileFunc(fileId).then((fileInfo) => {
					if (fileInfo === null) {
						throw new Error("File not found");
					}
					this.files!.push(fileInfo);
				}),
			),
		).then((_) => undefined);
	}

	addFileId(fileId: string): void {
		if (this.files !== undefined) {
			throw new Error("Files already filled, can't add just file id");
		}
		this.fileIds.push(fileId);
	}

	removeFileId(fileId: string): void {
		this.fileIds = this.fileIds.filter((id) => id !== fileId);
	}

	attachToNode(nodeId: string): void {
		if (this.nodeIds.includes(nodeId)) {
			throw new Error("Node already attached");
		}
		this.nodeIds.push(nodeId);
	}

	detachFromNode(nodeId: string): void {
		this.nodeIds = this.nodeIds.filter((id) => id !== nodeId);
	}

	relateTo(document: Document, relation: DocumentRelationType): void {
		if (
			this.relations.find(
				(r) => r.documentId === document.id && r.type === relation,
			)
		) {
			throw new Error("Document already related");
		}
		this.relations.push(new DocumentRelation(document.id, relation));
	}

	unrelateFrom(document: Document, relation: DocumentRelationType): void {
		this.relations = this.relations.filter(
			(r) => r.documentId !== document.id || r.type !== relation,
		);
	}
}

export class DocumentRelation {
	// id of document to that this document is related to
	@IsUUID()
	documentId: string;

	@IsOptional()
	@IsInstance(Document)
	document?: Document;

	@IsEnum(DocumentRelationType)
	type: DocumentRelationType;

	@IsBefore("updatedAt")
	createdAt: Date;

	updatedAt: Date;

	@IsOptional()
	@IsDate()
	deletedAt: Date | null;

	constructor(documentId: string, type: DocumentRelationType);
	constructor(
		documentId: string,
		type: DocumentRelationType,
		createdAt: Date,
		updatedAt: Date,
		deletedAt: Date | null,
	);
	constructor(
		documentId: string,
		type: DocumentRelationType,
		createdAt?: Date,
		updatedAt?: Date,
		deletedAt?: Date | null,
	) {
		this.documentId = documentId;
		this.type = type;
		this.createdAt = createdAt || new Date();
		this.updatedAt = updatedAt || this.createdAt;
		this.deletedAt = deletedAt || null;
		ValidateObject(this);
	}
}
