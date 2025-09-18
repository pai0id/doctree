import { Injectable } from "@nestjs/common";
import { MinioClient } from "../../minio/client/client";
import { BufferedFile } from "../domain/bufferedfile.domain";

@Injectable()
export class FileRepository {
	constructor(private minioClient: MinioClient) {}

	async listBuckets(): Promise<string[]> {
		return this.minioClient
			.listBuckets()
			.then((buckets) => buckets.map((bucket) => bucket.name));
	}

	async putObject(
		bucketName: string,
		key: string,
		file: BufferedFile,
	): Promise<void> {
		return new Promise((resolve, reject) => {
			this.minioClient
				.putObject(bucketName, key, file.buffer, file.size)
				.then((obj) => resolve())
				.catch(reject);
		});
	}

	async deleteObject(bucketName: string, objectName: string): Promise<void> {
		return new Promise((resolve, reject) => {
			this.minioClient
				.removeObject(bucketName, objectName)
				.then((obj) => resolve())
				.catch(reject);
		});
	}

	async getUrl(bucketName: string, objectName: string): Promise<string> {
		return this.minioClient.presignedUrl("GET", bucketName, objectName);
	}

	async loadObject(bucketName: string, objectName: string): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			const chunks: Buffer[] = [];

			this.minioClient
				.getObject(bucketName, objectName)
				.then((stream) => {
					stream.on("data", (chunk) => {
						chunks.push(chunk);
					});

					stream.on("end", () => {
						resolve(Buffer.concat(chunks));
					});

					stream.on("error", (err) => {
						reject(err);
					});
				})
				.catch(reject);
		});
	}
}
