import {
	Entity,
	OneToMany,
	Column,
	ManyToOne,
	OneToOne,
	ManyToMany,
	JoinTable,
	CreateDateColumn,
	UpdateDateColumn,
	DeleteDateColumn,
	PrimaryColumn,
	PrimaryGeneratedColumn,
	JoinColumn,
} from "typeorm";
import { BaseEntity } from "../../database/base/base.entity";
import { DocumentRelationType } from "../domain/doc.model";

@Entity("documents")
export class DocumentEntity extends BaseEntity {
	@Column()
	title: string;

	@Column({ nullable: true, type: String })
	description: string | null;

	@OneToMany(() => DocumentTagEntity, (documentTag) => documentTag.document, {
		cascade: true,
	})
	tags: DocumentTagEntity[];

	@OneToMany(
		() => DocumentFileEntity,
		(documentFile) => documentFile.document,
		{ cascade: true },
	)
	documentFiles?: DocumentFileEntity[];

	@OneToMany(() => DocumentNodeEntity, (dn) => dn.document, { cascade: true })
	documentNodes?: DocumentNodeEntity[];

	@OneToMany(() => DocumentRelationEntity, (dr) => dr.document0, {
		cascade: true,
	})
	relations?: DocumentRelationEntity[];
}

@Entity("nodes")
export class NodeEntity extends BaseEntity {
	@Column({ type: "text" })
	title: string;
}

@Entity("documents_tags")
export class DocumentTagEntity {
	@ManyToOne(() => DocumentEntity, (document) => document.tags)
	@JoinColumn({ name: "document_id" })
	document: DocumentEntity;

	@PrimaryColumn({ name: "document_id" })
	documentId: string;

	@PrimaryColumn({ name: "tag" })
	tag: string;

	@CreateDateColumn({ name: "created_at" })
	createdAt?: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt?: Date;

	@DeleteDateColumn({ name: "deleted_at" })
	deletedAt?: Date | null;
}

@Entity("documents_files")
export class DocumentFileEntity {
	@ManyToOne(() => DocumentEntity, (document) => document.documentFiles, {
		orphanedRowAction: "soft-delete",
	})
	@JoinColumn({ name: "document_id" })
	document: DocumentEntity;

	@PrimaryColumn({ name: "document_id" })
	documentId: string;

	@PrimaryColumn({ name: "file_id" })
	fileId: string;

	@CreateDateColumn({ name: "created_at" })
	createdAt?: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt?: Date;

	@DeleteDateColumn({ name: "deleted_at" })
	deletedAt?: Date | null;
}

@Entity("parsed_files")
export class ParsedFileEntity {
	@OneToOne(() => DocumentFileEntity)
	@JoinColumn({ name: "file_id", referencedColumnName: "fileId" })
	documentFile: DocumentFileEntity;

	@PrimaryColumn({ name: "file_id" })
	fileId: string;

	@Column({ name: "text" })
	text: string;

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt: Date;

	@DeleteDateColumn({ name: "deleted_at" })
	deletedAt: Date | null;
}

@Entity("documents_nodes")
export class DocumentNodeEntity {
	@ManyToOne(() => DocumentEntity, (document) => document.documentNodes, {
		orphanedRowAction: "soft-delete",
	})
	@JoinColumn({ name: "document_id" })
	document: DocumentEntity;

	@PrimaryColumn({ name: "document_id" })
	documentId: string;

	@PrimaryColumn({ name: "node_id" })
	nodeId: string;

	@CreateDateColumn({ name: "created_at" })
	createdAt?: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt?: Date;

	@DeleteDateColumn({ name: "deleted_at" })
	deletedAt?: Date | null;
}

@Entity("document_relations")
export class DocumentRelationEntity {
	@ManyToOne(() => DocumentEntity, (document) => document.relations, {
		orphanedRowAction: "soft-delete",
	})
	@JoinColumn({ name: "document_id0" })
	document0: DocumentEntity;

	@PrimaryColumn({ name: "document_id0" })
	documentId0: string;

	@PrimaryColumn({ name: "document_id1" })
	documentId1: string;

	@PrimaryColumn({ name: "relation" })
	relation: DocumentRelationType;

	@CreateDateColumn({ name: "created_at" })
	createdAt?: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt?: Date;

	@DeleteDateColumn({ name: "deleted_at" })
	deletedAt?: Date | null;
}
