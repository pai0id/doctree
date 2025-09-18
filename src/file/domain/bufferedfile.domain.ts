import { Buffer } from "buffer";

export interface BufferedFile {
	filename: string;
	buffer: Buffer;
	size: number;
}
