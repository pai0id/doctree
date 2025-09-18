import {
	Entity,
	Column,
	Tree,
	TreeChildren,
	TreeParent,
	OneToMany,
	ManyToOne,
	JoinColumn,
} from "typeorm";
import { BaseEntity } from "../../database/base/base.entity";

@Entity("nodes")
@Tree("closure-table", {
	closureTableName: "node",
	ancestorColumnName: (column) => "ancestor_" + column.propertyName,
	descendantColumnName: (column) => "descendant_" + column.propertyName,
})
export class TreeEntity extends BaseEntity {
	@Column({ type: "text" })
	title: string;

	@TreeChildren()
	children?: TreeEntity[];

	@TreeParent()
	@JoinColumn({ name: "parent_id" })
	parent?: TreeEntity | null;

	constructor(
		title: string,
		id: string,
		createdAt: Date,
		updatedAt: Date,
		deletedAt: Date | null,
		children: TreeEntity[] | undefined,
		parent: TreeEntity | null | undefined,
	) {
		super();
		this.title = title;
		this.children = children;
		this.parent = parent;
		this.id = id;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.deletedAt = deletedAt;
	}

	forEach(fn: (child: TreeEntity) => void): void {
		fn(this);
		if (this.children !== undefined) {
			for (const child of this.children) {
				child.forEach(fn);
			}
		} else {
			throw new Error("Children undefined");
		}
	}
}
