import { StoredFileInfo } from "../domain/meta.domain";
import { FileInfo } from "./info.entity";

export class FileInfoMapper {
	static toEntity(fileInfo: StoredFileInfo): FileInfo {
		return {
			id: fileInfo.id,
			title: fileInfo.title,
			description: fileInfo.description,
			filebucket: fileInfo.filebucket,
			filekey: fileInfo.filekey,
			createdAt: fileInfo.createdAt,
			updatedAt: fileInfo.updatedAt,
			deletedAt: fileInfo.deletedAt,
		};
	}

	static toDomain(fileInfo: FileInfo): StoredFileInfo {
		return new StoredFileInfo(
			fileInfo.title,
			fileInfo.description,
			fileInfo.filebucket,
			fileInfo.filekey,
			fileInfo.id,
			fileInfo.createdAt,
			fileInfo.updatedAt,
			fileInfo.deletedAt,
		);
	}
}
