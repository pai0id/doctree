import { Module } from "@nestjs/common";
import { DocumentController } from "./api/doc.controller";
import { DocumentRepository } from "./infra/doc.repository";
import { DocumentService } from "./services/doc.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
	DocumentEntity,
	DocumentFileEntity,
	DocumentTagEntity,
	DocumentNodeEntity,
	DocumentRelationEntity,
	NodeEntity,
} from "./infra/doc.entity";
import { FileModule } from "../file/file.module";
import { ConfigModule } from "@nestjs/config";
import { TreeModule } from "../tree/tree.module";

@Module({
	controllers: [DocumentController],
	providers: [DocumentRepository, DocumentService],
	imports: [
		TypeOrmModule.forFeature([
			DocumentEntity,
			DocumentTagEntity,
			DocumentFileEntity,
			DocumentNodeEntity,
			DocumentRelationEntity,
			NodeEntity,
		]),
		FileModule,
		ConfigModule,
		TreeModule,
	],
})
export class DocumentModule {}
