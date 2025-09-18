import { TreeEntity } from "./tree.entity";
import { Tree } from "../domain/tree.model";

export class TreeMapper {
	static toDomain(treeEntity: TreeEntity): Tree {
		let children: Tree[] = [];
		if (treeEntity.children) {
			children = treeEntity.children.map((child) => TreeMapper.toDomain(child));
		}
		return new Tree(
			treeEntity.title,
			treeEntity.id,
			treeEntity.createdAt,
			treeEntity.updatedAt,
			treeEntity.deletedAt,
			children,
		);
	}

	static toEntity(
		tree: Tree,
		parent: TreeEntity | undefined = undefined,
	): TreeEntity {
		const children: TreeEntity[] = [];
		const current: TreeEntity = new TreeEntity(
			tree.title,
			tree.id,
			tree.createdAt,
			tree.updatedAt,
			tree.deletedAt,
			children,
			parent,
		);
		if (tree.children) {
			children.push(
				...tree.children.map((child) => TreeMapper.toEntity(child, current)),
			);
		}

		return current;
	}
}
