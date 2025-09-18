import { Node } from "../../domain/node.model";

export type GetAllNodeResponseDto = Pick<
	Node,
	"id" | "title" | "parentId" | "createdAt" | "updatedAt" | "deletedAt"
>[];

export type GetNodeResponseDto = Pick<
	Node,
	"id" | "title" | "parentId" | "createdAt" | "updatedAt" | "deletedAt"
>;
