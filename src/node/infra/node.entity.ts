import { Entity, Column } from "typeorm";
import { BaseEntity } from "../../database/base/base.entity";

@Entity("nodes")
export class NodeEntity extends BaseEntity {
	@Column({ type: "text" })
	title: string;

	@Column({ name: "parent_id", nullable: true, type: String })
	parentId: string | null;
}
