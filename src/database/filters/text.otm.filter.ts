import { IFilter } from "./filter.interface";
import { SelectQueryBuilder, ObjectLiteral, EntityTarget } from "typeorm";

export class TextOneToManyFilter<
	T extends ObjectLiteral, // root entity
	R extends ObjectLiteral, // relation entity
	DTO extends Record<string, any>,
> implements IFilter<T>
{
	private searchTerm?: string;
	private aliasCounter = 0;
	private relationName: string;

	constructor(
		private readonly relationField: Extract<keyof R, string>,
		private readonly queryParamName: Extract<keyof DTO, string>,
		private readonly rootJoinField: Extract<keyof T, string>,
		private readonly relationJoinField: Extract<keyof R, string>,
		relation: EntityTarget<R>,
	) {
		if (typeof relation === "function") {
			this.relationName = relation.name;
		} else {
			this.relationName = String(relation);
		}
	}

	parse(query: Record<string, any>): void {
		const value = query[this.queryParamName];
		this.searchTerm =
			typeof value === "string" && value.trim() ? value.trim() : undefined;
	}

	apply(query: SelectQueryBuilder<T>): void {
		if (!this.searchTerm) return;

		const currAlias = `${this.relationName}_${this.aliasCounter++}`;

		query.leftJoin(
			this.relationName,
			currAlias,
			`${currAlias}.${this.relationJoinField} = ${query.alias}.${this.rootJoinField}`,
		);

		const paramName = `search_${currAlias}_${this.relationField}`;

		query.andWhere(
			`LOWER(${currAlias}.${this.relationField}) LIKE :${paramName}`,
			{ [paramName]: `%${this.searchTerm.toLowerCase()}%` },
		);
	}
}
