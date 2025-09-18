import { BufferedFile } from "../../domain/bufferedfile.domain";

export interface UploadRequest {
	file: BufferedFile;
	filedir: string;
	filebucket: string;
}
