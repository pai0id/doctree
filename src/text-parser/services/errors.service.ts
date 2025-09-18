export class NoParserFoundError extends Error {
	constructor(fileType: string) {
		super(`No parser found for file type ${fileType}`);
	}
}

export class FileNotFoundError extends Error {
	constructor(fileId: string) {
		super(`File with ID ${fileId} not found`);
	}
}
