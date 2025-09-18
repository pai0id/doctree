import { BaseModel } from "../../base/base.model";
import { IsString, ValidateNested, IsOptional } from "class-validator";
import { Type } from "class-transformer";
import { ValidateObject } from "../../utils/validate.throw";

export class Tree extends BaseModel {
	@IsString()
	title: string;

	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => Tree)
	children?: Tree[];

	// @IsOptional()
	// @Type(() => Tree)
	// parent?: Tree | null;

	constructor(title: string);
	constructor(
		title: string,
		id?: string,
		createdAt?: Date,
		updatedAt?: Date,
		deletedAt?: Date | null,
		children?: Tree[],
	);
	constructor(
		title: string,
		id?: string,
		createdAt?: Date,
		updatedAt?: Date,
		deletedAt?: Date | null,
		children?: Tree[],
	) {
		if (arguments.length === 1) {
			super();
		} else {
			super(id!, createdAt!, updatedAt!, deletedAt!);
		}
		this.title = title;
		this.children = children || [];
		ValidateObject(this);
	}

	hasCycle(): boolean {
		const visited = new Set<string>();
		const CurrentPath = new Set<string>();

		// DFS traversal
		const hasCycleUtil = (node: Tree): boolean => {
			if (CurrentPath.has(node.id)) {
				// if in current path, then it's a cycle
				return true;
			}

			if (visited.has(node.id)) {
				// If we've already visited this node but it's not in the current path,
				// then it's not part of a cycle in this path (already checked all children's paths)
				return false;
			}

			visited.add(node.id);
			CurrentPath.add(node.id);

			if (node.children) {
				for (const child of node.children) {
					if (hasCycleUtil(child)) {
						return true;
					}
				}
			}

			CurrentPath.delete(node.id);

			return false;
		};

		return hasCycleUtil(this);
	}

	deleteSubTree(childId: string): void {
		if (this.children !== undefined) {
			const child = this.children.find((child) => child.id === childId);
			if (child) {
				const reqDelete = (child) => {
					child.markDeleted();
					// child.parent = null;
					this.children = this.children!.filter((c) => c.id !== child.id);

					if (child.children !== undefined) {
						child.children.forEach(reqDelete);
					}
				};
				reqDelete(child);
			} else {
				this.children.forEach((child) => child.deleteSubTree(childId));
			}
		} else {
			throw new TreeChildrenUndefinedError();
		}
	}

	deleteChild(childId: string): Tree | null {
		if (this.children !== undefined) {
			const child = this.children.find((child) => child.id === childId);
			if (child) {
				if (child.children === undefined) {
					throw new TreeChildrenUndefinedError();
				}

				for (const c of child.children) {
					this.children.push(c);
					// c.parent = this;
				}

				// soft delete
				child.children = [];
				child.markDeleted();
				// child.parent = null;
				this.children = this.children.filter((c) => c.id !== childId);

				return child;
			} else {
				for (const c of this.children) {
					const deleted = c.deleteChild(childId);
					if (deleted) {
						return deleted;
					}
				}
			}
		} else {
			throw new TreeChildrenUndefinedError();
		}
		return null;
	}

	addChild(child: Tree): void {
		if (this.children !== undefined) {
			this.children.push(child);
			if (this.hasCycle()) {
				this.children = this.children.filter((child) => child.id !== child.id);
				throw new Error("Cycle detected");
			}
			// child.parent = this;
		} else {
			throw new TreeChildrenUndefinedError();
		}
	}

	// Finds subtree with given criteria (maybe root of it's children)
	find(criteria: (child: Tree) => boolean): Tree | null {
		if (criteria(this)) {
			return this;
		}
		if (this.children !== undefined) {
			for (const child of this.children) {
				if (!child.isDeleted()) {
					const result = child.find(criteria);
					if (result) {
						return result;
					}
				}
			}
		} else {
			throw new TreeChildrenUndefinedError();
		}
		return null;
	}

	forEach(fn: (child: Tree) => void): void {
		fn(this);
		if (this.children !== undefined) {
			if (!this.isDeleted()) {
				for (const child of this.children) {
					child.forEach(fn);
				}
			}
		} else {
			throw new TreeChildrenUndefinedError();
		}
	}
}

export class TreeChildrenUndefinedError extends Error {
	constructor() {
		super("Children undefined");
	}
}

export class TreeHasCycleError extends Error {
	constructor() {
		super("Cycle detected");
	}
}

export class TreeParentUndefinedError extends Error {
	constructor() {
		super("Parent undefined");
	}
}
