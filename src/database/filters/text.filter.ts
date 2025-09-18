import { SelectQueryBuilder, ObjectLiteral } from "typeorm";
import { IFilter } from "./filter.interface";

export class TextFilter<
	T extends ObjectLiteral,
	DTO extends Record<string, any>,
> implements IFilter<T>
{
	private searchTerm?: string;

	constructor(
		private readonly fieldName: Extract<keyof T, string>,
		private readonly queryParamName: Extract<keyof DTO, string>,
	) {}

	parse(query: Record<string, any>): void {
		const value = query[this.queryParamName];
		this.searchTerm =
			typeof value === "string" && value.trim() ? value.trim() : undefined;
	}

	apply(query: SelectQueryBuilder<T>): void {
		if (!this.searchTerm) return;

		const paramName = `search_${this.fieldName}`;

		query.andWhere(
			`LOWER(${query.alias}.${this.fieldName}) LIKE :${paramName}`,
			{ [paramName]: `%${this.searchTerm.toLowerCase()}%` },
		);
	}
}
