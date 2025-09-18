import { IsUUID, IsDate, IsOptional } from "class-validator";
import { IsBefore } from "./before";
import { randomUUID } from "crypto";

export abstract class BaseModel {
	@IsUUID("4")
	id: string;

	@IsBefore("updatedAt")
	createdAt: Date;

	updatedAt: Date;

	@IsOptional()
	@IsDate()
	deletedAt: Date | null;

	baseNew() {
		this.id = randomUUID();
		this.createdAt = new Date();
		this.updatedAt = this.createdAt;
		this.deletedAt = null;
	}

	constructor();
	constructor(
		id: string,
		createdAt: Date,
		updatedAt: Date,
		deletedAt: Date | null,
	);
	constructor(
		id?: string,
		createdAt?: Date,
		updatedAt?: Date,
		deletedAt?: Date | null,
	) {
		this.baseNew();
		if (id && createdAt && updatedAt && (deletedAt === null || deletedAt)) {
			this.id = id;
			this.createdAt = createdAt;
			this.updatedAt = updatedAt;
			this.deletedAt = deletedAt;
		}
	}

	isDeleted(): boolean {
		return this.deletedAt !== null;
	}

	markDeleted(): void {
		this.deletedAt = new Date();
	}
}
