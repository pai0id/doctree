import { Injectable } from "@nestjs/common";
import { NodeRepository } from "../infra/node.repository";
import { Node } from "../domain/node.model";
import {
	GetAllNodeResponseDto,
	GetNodeResponseDto,
} from "./responses/get.response";
// import { IsUUID } from 'class-validator';
import { UpdateNodeTitleRequest } from "./requests/update.request";
import { NotFoundException, ConflictException } from "../../errors/errors";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class NodeService {
	constructor(
		// @InjectRepository(Node)
		private readonly nodeRepository: NodeRepository,
	) {}

	async getAllNodes(): Promise<GetAllNodeResponseDto> {
		return this.nodeRepository.getAllNodes();
	}

	// async createNode(createNodeRequest: CreateNodeRequest): Promise<Node> {
	//   const node = new Node(createNodeRequest.title, createNodeRequest.parentId);
	//   await this.nodeRepository.createNode(node);
	//   return node;
	// }

	async getNode(nodeId: string): Promise<GetNodeResponseDto> {
		const node = await this.nodeRepository.getNode(nodeId);
		if (node === null) {
			throw new NotFoundException("Node not found");
		}
		return node;
	}

	async updateNodeTitle(req: UpdateNodeTitleRequest): Promise<void> {
		await this.nodeRepository.updateNodeTitle(req.id, req.title);
	}

	// async updateNode(updateRequest: UpdateNodeRequest): Promise<Node> {
	//   const { id, title, parentId } = updateRequest;

	//   const node = await this.nodeRepository.getNode(id);
	//   if (!node) {
	//     throw new NodeNotFoundError('Node not found');
	//   }

	//   if (parentId !== undefined && parentId !== node.parentId) {
	//     await this.checkForLoop(id, parentId);
	//   }

	//   if (title !== undefined) {
	//     node.title = title;
	//   }
	//   if (parentId !== undefined) {
	//     node.parentId = parentId;
	//   }

	//   return this.nodeRepository.updateNode(node);
	// }

	private async checkForLoop(
		nodeId: string,
		potentialParentId: string,
	): Promise<void> {
		if (nodeId === potentialParentId) {
			throw new ConflictException("Cannot set a node as its own parent");
		}

		let currentParentId: string | null = potentialParentId;
		const visited = new Set<string>([nodeId]);

		while (currentParentId) {
			if (visited.has(currentParentId)) {
				throw new ConflictException(
					"This change would create a circular dependency in the hierarchy",
				);
			}
			visited.add(currentParentId);

			const parentNode = await this.nodeRepository.getNode(currentParentId);
			if (!parentNode) {
				throw new NotFoundException("Parent node not found");
			}
			currentParentId = parentNode.parentId;
		}
	}
}
