import { IFilter } from "./filter.interface";
import { SelectQueryBuilder, ObjectLiteral, EntityTarget } from "typeorm";

export class TextManyToManyFilter<
	T extends ObjectLiteral, // root entity
	R extends ObjectLiteral, // relation entity
	J extends ObjectLiteral, // junction entity
	DTO extends Record<string, any>,
> implements IFilter<T>
{
	private searchTerm?: string;
	private aliasCounter = 0;
	private relationName: string;
	private junctionName: string;

	constructor(
		private readonly relationField: Extract<keyof R, string>,
		private readonly queryParamName: Extract<keyof DTO, string>,
		private readonly rootJoinField: Extract<keyof T, string>,
		private readonly junctionRootField: Extract<keyof J, string>,
		private readonly junctionRelationField: Extract<keyof J, string>,
		private readonly relationJoinField: Extract<keyof R, string>,
		relation: EntityTarget<R>,
		junction: EntityTarget<J>,
	) {
		if (typeof relation === "function") {
			this.relationName = relation.name;
		} else {
			this.relationName = String(relation);
		}

		if (typeof junction === "function") {
			this.junctionName = junction.name;
		} else {
			this.junctionName = String(junction);
		}
	}

	parse(query: Record<string, any>): void {
		const value = query[this.queryParamName];
		this.searchTerm =
			typeof value === "string" && value.trim() ? value.trim() : undefined;
	}

	apply(query: SelectQueryBuilder<T>): void {
		if (!this.searchTerm) return;

		const junctionAlias = `${this.junctionName}_${this.aliasCounter++}`;
		const relationAlias = `${this.relationName}_${this.aliasCounter++}`;

		query.leftJoin(
			this.junctionName,
			junctionAlias,
			`${junctionAlias}.${this.junctionRootField} = ${query.alias}.${this.rootJoinField}`,
		);

		query.leftJoin(
			this.relationName,
			relationAlias,
			`${relationAlias}.${this.relationJoinField} = ${junctionAlias}.${this.junctionRelationField}`,
		);

		const paramName = `search_${relationAlias}_${this.relationField}`;

		query.andWhere(
			`LOWER(${relationAlias}.${this.relationField}) LIKE :${paramName}`,
			{ [paramName]: `%${this.searchTerm.toLowerCase()}%` },
		);
	}
}
