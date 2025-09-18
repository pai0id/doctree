import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ParsedFileEntity } from "./parsedfile.entity";
import { ParseFileResponse } from "../../text-parser/services/responses/parse.response";
import { ParsedFileMapper } from "./parsedfile.mapper";

@Injectable()
export class ParsedFileRepo {
	constructor(private dataSource: DataSource) {}

	async save(file: ParseFileResponse): Promise<void> {
		const repo = this.dataSource.getRepository(ParsedFileEntity);

		return new Promise((resolve, reject) => {
			repo
				.save(ParsedFileMapper.toEntity(file))
				.then((_) => resolve())
				.catch(reject);
		});
	}
}
