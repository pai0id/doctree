import { Client } from "minio";

export interface MinioConfig {
	endPoint: string;
	port: number;
	accessKey: string;
	secretKey: string;
	useSSL: boolean;
}

export class MinioClient extends Client {
	constructor(config: MinioConfig) {
		super({
			endPoint: config.endPoint,
			port: config.port,
			accessKey: config.accessKey,
			secretKey: config.secretKey,
			useSSL: config.useSSL,
		});
	}
}
