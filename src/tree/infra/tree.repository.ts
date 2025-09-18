import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { TreeEntity } from "./tree.entity";
import { Tree } from "../domain/tree.model";
import { TreeMapper } from "./tree.mapper";
import { NotFoundException } from "../../errors/errors";

@Injectable()
export class TreeRepository {
	constructor(private dataSource: DataSource) {}
	async getAllTrees(): Promise<Tree[]> {
		return this.dataSource
			.getTreeRepository(TreeEntity)
			.findTrees()
			.then((trees) => trees.map(TreeMapper.toDomain));
	}

	async getTreeAsRoot(id: string): Promise<Tree> {
		const treeRep = this.dataSource.getTreeRepository(TreeEntity);
		const node = await treeRep.findOneBy({ id: id });
		if (!node) {
			throw new NotFoundException("Node not found");
		}
		return treeRep
			.findDescendantsTree(node)
			.then((tree) => TreeMapper.toDomain(tree));
	}

	async getTreeAsPart(id: string): Promise<Tree> {
		const rep = this.dataSource.getRepository(TreeEntity);

		const root = await rep
			.createQueryBuilder("node")
			.where("(node.parent_id IS NULL AND node.id = :id)", { id })
			.orWhere((qb) => {
				const subQuery = qb
					.subQuery()
					.select("DISTINCT nc.ancestor_id")
					.from("node_closure", "nc")
					.where("nc.descendant_id = :id")
					.andWhere("nc.ancestor_id != nc.descendant_id")
					.getQuery();
				return "node.id IN " + subQuery;
			})
			.setParameter("id", id)
			.getOne();

		if (root == null) {
			throw new NotFoundException("Node not found");
		}

		const treeRep = this.dataSource.getTreeRepository(TreeEntity);

		return treeRep
			.findDescendantsTree(root)
			.then((tree) => TreeMapper.toDomain(tree));
	}

	async createNode(node: Tree, parentId: string | null): Promise<Tree> {
		const treeRep = this.dataSource.getTreeRepository(TreeEntity);
		const treeEntity = TreeMapper.toEntity(node);
		if (parentId !== null) {
			treeEntity.parent = await treeRep.findOneBy({ id: parentId });
			if (treeEntity.parent == null) {
				throw new NotFoundException("Parent node not found");
			}
		} else {
			treeEntity.parent = null;
		}
		return treeRep.save(treeEntity).then((node) => TreeMapper.toDomain(node));
	}

	async updateNodeAsRoot(
		id: string,
		updatefn: (tree: Tree) => Promise<Tree>,
	): Promise<Tree> {
		const tree = await this.getTreeAsRoot(id);
		return this.updateTree(tree, updatefn);
	}

	async updateNodeAsPart(
		id: string,
		updatefn: (tree: Tree) => Promise<Tree>,
	): Promise<Tree> {
		const tree = await this.getTreeAsPart(id);
		return this.updateTree(tree, updatefn);
	}

	async updateTree(
		tree: Tree,
		updatefn: (tree: Tree) => Promise<Tree>,
	): Promise<Tree> {
		tree = await updatefn(tree);
		const treeRep = this.dataSource.getTreeRepository(TreeEntity);

		const treeEntity = TreeMapper.toEntity(tree);

		const treeArr: TreeEntity[] = [];

		treeEntity.forEach((child) => {
			treeArr.push(child);
		});

		treeRep.save(treeArr);

		return tree;
	}

	async isRootNode(id: string): Promise<boolean> {
		const treeRep = this.dataSource.getTreeRepository(TreeEntity);
		return treeRep
			.findOne({
				where: {
					id: id,
				},
				relations: ["parent"],
			})
			.then((node) => {
				if (node === null) {
					throw new NotFoundException("Node not found");
				}
				return node.parent === null;
			});
	}

	async deleteNodeCascade(id: string): Promise<void> {
		const rep = this.dataSource.getRepository(TreeEntity);
		await rep
			.createQueryBuilder()
			.softDelete()
			.where("id = :id", { id: id })
			.orWhere(
				"id IN (SELECT descendant_id FROM node_closure WHERE ancestor_id = :id)",
				{ id: id },
			)
			.execute();
	}

	async deleteNode(id: string): Promise<void> {
		const rep = this.dataSource.getRepository(TreeEntity);
		await rep
			.createQueryBuilder()
			.softDelete()
			.where("id = :id", { id: id })
			.execute();
	}
}
