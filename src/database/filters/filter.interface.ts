import { ObjectLiteral, SelectQueryBuilder } from "typeorm";

export interface IFilter<T extends ObjectLiteral> {
	parse(query: Record<string, any>): void;
	apply(query: SelectQueryBuilder<T>): void;
}
