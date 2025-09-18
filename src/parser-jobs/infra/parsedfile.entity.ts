import {
	Entity,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	DeleteDateColumn,
	PrimaryColumn,
} from "typeorm";

@Entity("parsed_files")
export class ParsedFileEntity {
	@PrimaryColumn({ name: "file_id" })
	fileId: string;

	@Column({ name: "text" })
	text: string;

	@Column({ name: "parsed_percentage", type: "float" })
	parsedPercentage: number | null;

	@Column({ name: "parsed_comment", nullable: true, type: String })
	parsedComment: string | null;

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt: Date;

	@DeleteDateColumn({ name: "deleted_at" })
	deletedAt: Date | null;
}
