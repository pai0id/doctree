import { BaseEntity } from "../../database/base/base.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("files")
export class FileInfo extends BaseEntity {
	@Column()
	title: string;

	@Column({ nullable: true, type: String })
	description: string | null;

	@Column({ name: "filebucket" })
	filebucket: string;

	@Column({ name: "filekey" })
	filekey: string;
}
