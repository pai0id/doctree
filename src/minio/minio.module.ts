import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MinioClient } from "./client/client";

@Module({
	exports: [MinioClient],
	imports: [ConfigModule],
	providers: [
		{
			inject: [ConfigService],
			provide: MinioClient,
			useFactory: async (
				configService: ConfigService,
			): Promise<MinioClient> => {
				const client = new MinioClient({
					endPoint: configService.getOrThrow("MINIO_ENDPOINT"),
					port: configService.getOrThrow("MINIO_PORT"),
					accessKey: configService.getOrThrow("MINIO_ACCESS_KEY"),
					secretKey: configService.getOrThrow("MINIO_SECRET_KEY"),
					useSSL: false,
				});
				return client;
			},
		},
	],
})
export class MinioModule {}
