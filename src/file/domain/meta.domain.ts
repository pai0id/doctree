import { BaseModel } from "../../base/base.model";

export class StoredFileInfo extends BaseModel {
	title: string;
	description: string | null;

	filebucket: string;
	filekey: string;

	constructor(
		title: string,
		description: string | null,
		filebucket: string,
		filename: string,
	);
	constructor(
		title: string,
		description: string | null,
		filebucket: string,
		filename: string,
		id: string,
		createdAt: Date,
		updatedAt: Date,
		deletedAt: Date | null,
	);
	constructor(
		title: string,
		description: string | null,
		filebucket: string,
		filename: string,
		id?: string,
		createdAt?: Date,
		updatedAt?: Date,
		deletedAt?: Date | null,
	) {
		if (arguments.length <= 4) {
			super();
		} else {
			super(id!, createdAt!, updatedAt!, deletedAt!);
		}
		this.title = title;
		this.description = description;
		this.filebucket = filebucket;
		this.filekey = filename;
	}

	addDir(dir: string): void {
		this.filekey = dir + "/" + this.filekey;
	}

	getFileName(): string {
		return this.filekey.split("/")[-1];
	}
}
