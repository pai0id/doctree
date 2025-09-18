import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { StoredFileInfo } from "../domain/meta.domain";
import { FileInfo } from "./info.entity";
import { FileInfoMapper } from "./info.mapper";

@Injectable()
export class FileInfoRepository {
	constructor(private dataSource: DataSource) {}

	async save(fileInfo: StoredFileInfo): Promise<void> {
		const repo = this.dataSource.getRepository(FileInfo);

		return new Promise((resolve, reject) => {
			repo
				.save(FileInfoMapper.toEntity(fileInfo))
				.then((_) => resolve())
				.catch(reject);
		});
	}

	async hardDelete(fileId: string): Promise<void> {
		const repo = this.dataSource.getRepository(FileInfo);

		return new Promise((resolve, reject) => {
			repo
				.delete({ id: fileId })
				.then((_) => resolve())
				.catch(reject);
		});
	}

	async get(fileId: string): Promise<StoredFileInfo | null> {
		const repo = this.dataSource.getRepository(FileInfo);

		return repo
			.findOneBy({ id: fileId })
			.then((entity) => (entity ? FileInfoMapper.toDomain(entity) : null));
	}

	async softDelete(fileId: string): Promise<void> {
		const repo = this.dataSource.getRepository(FileInfo);

		return new Promise((resolve, reject) => {
			repo
				.softDelete({ id: fileId })
				.then((_) => resolve())
				.catch((err) => reject(err));
		});
	}
}
