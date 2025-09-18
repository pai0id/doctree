import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { NodeModule } from "./node/node.module";
import { DatabaseModule } from "./database/database.module";
import { TreeModule } from "./tree/tree.module";
import { MinioModule } from "./minio/minio.module";
import { FileModule } from "./file/file.module";
import { DocumentModule } from "./documents/doc.module";
import { ParseModule } from "./text-parser/parse.module";
import { ParsingJobModule } from "./parser-jobs/job.module";

@Module({
	imports: [
		DatabaseModule,
		MinioModule,
		NodeModule,
		TreeModule,
		FileModule,
		DocumentModule,
		ParseModule,
		ParsingJobModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
