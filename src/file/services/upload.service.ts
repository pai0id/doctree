import { Injectable } from "@nestjs/common";
import { FileInfoRepository } from "../infra/info.repository";
import { FileRepository } from "../infra/file.repository";
import { ConfigService } from "@nestjs/config";
import { StoredFileInfo } from "../domain/meta.domain";
import { Logger } from "@nestjs/common";
import { UploadRequest } from "./requests/upload.request";
import {
	DownloadFileResponse,
	GetFileResponse,
	DownloadFileResponseFromDomain,
} from "./responses/get.file";
import { GetFileResponseFromDomain } from "./responses/get.file";
import { FileInfo } from "../infra/info.entity";

@Injectable()
export class UploadFileService {
	private readonly logger = new Logger(UploadFileService.name);
	constructor(
		private info: FileInfoRepository,
		private readonly fileRep: FileRepository,
		private readonly configService: ConfigService,
	) {}

	async uploadFile(req: UploadRequest): Promise<StoredFileInfo> {
		const fileInfo = new StoredFileInfo(
			req.file.filename,
			null,
			req.filebucket,
			req.file.filename,
		);
		fileInfo.addDir(req.filedir);
		const fpromise = this.fileRep.putObject(
			fileInfo.filebucket,
			fileInfo.filekey,
			req.file,
		);
		const ipromise = this.info.save(fileInfo);
		return Promise.all([fpromise, ipromise]).then(
			(_) => fileInfo,
			(err) => {
				this.fileRep
					.deleteObject(fileInfo.filebucket, fileInfo.filekey)
					.catch((err) =>
						this.logger.error(
							"Error while deleting file after failed upload",
							err,
						),
					);
				this.info
					.hardDelete(fileInfo.id)
					.catch((err) =>
						this.logger.error(
							"Error while deleting file info after failed upload",
							err,
						),
					);
				throw err;
			},
		);
	}

	async deleteFile(fileId: string): Promise<void> {
		return this.info.softDelete(fileId);
	}

	async getFileInfo(fileId: string): Promise<StoredFileInfo | null> {
		return this.info.get(fileId);
	}

	async getFile(fileId: string): Promise<GetFileResponse | null> {
		return this.info
			.get(fileId)
			.then((fileInfo) =>
				fileInfo !== null ? GetFileResponseFromDomain(fileInfo) : null,
			);
	}

	async downloadFile(fileId: string): Promise<DownloadFileResponse | null> {
		return this.info.get(fileId).then((fileInfo) => {
			if (fileInfo !== null) {
				return this.fileRep
					.loadObject(fileInfo.filebucket, fileInfo.filekey)
					.then((fileBuffer) =>
						DownloadFileResponseFromDomain(fileInfo, fileBuffer),
					)
					.catch((err) => {
						throw new Error(`Failed to load file with ID ${fileId}`);
					});
			}

			return null;
		});
	}
}
