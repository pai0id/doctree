import { Tree } from "../../domain/tree.model";

export type GetAllTreesResponseDto = Pick<
	Tree,
	"id" | "title" | "children" | "createdAt" | "updatedAt" | "deletedAt"
>[];

export type GetSubTreeResponseDto = Pick<
	Tree,
	"id" | "title" | "children" | "createdAt" | "updatedAt" | "deletedAt"
>;

export type GetRootTreeResponseDto = Pick<
	Tree,
	"id" | "title" | "children" | "createdAt" | "updatedAt" | "deletedAt"
>;
