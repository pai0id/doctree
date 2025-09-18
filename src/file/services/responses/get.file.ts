import { StoredFileInfo } from "../../../file/domain/meta.domain";

export class GetFileResponse {
	id: string;
	title: string;
	description: string | null;
	fileUrl: string;
}

export function GetFileResponseFromDomain(
	fileInfo: StoredFileInfo,
): GetFileResponse {
	return {
		id: fileInfo.id,
		title: fileInfo.title,
		description: fileInfo.description,
		fileUrl: fileInfo.filebucket + "/" + fileInfo.filekey,
	};
}

export class DownloadFileResponse {
	id: string;
	title: string;
	description: string | null;
	fileUrl: string;
	file: Buffer;
}

export function DownloadFileResponseFromDomain(
	fileInfo: StoredFileInfo,
	file: Buffer,
): DownloadFileResponse {
	return {
		id: fileInfo.id,
		title: fileInfo.title,
		description: fileInfo.description,
		fileUrl: fileInfo.filebucket + "/" + fileInfo.filekey,
		file: file,
	};
}
