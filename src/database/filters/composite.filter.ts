import { IFilter } from "./filter.interface";
import { ObjectLiteral, SelectQueryBuilder } from "typeorm";

export class CompositeFilter<T extends ObjectLiteral> implements IFilter<T> {
	private filters: IFilter<T>[] = [];

	addFilter(filter: IFilter<T>): CompositeFilter<T> {
		this.filters.push(filter);
		return this;
	}

	parse(query: Record<string, any>): void {
		this.filters.forEach((filter) => filter.parse(query));
	}

	apply(query: SelectQueryBuilder<T>): void {
		this.filters.forEach((filter) => filter.apply(query));
	}
}
