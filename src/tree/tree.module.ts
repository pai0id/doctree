import { TypeOrmModule } from "@nestjs/typeorm";
import { TreeEntity } from "./infra/tree.entity";
import { TreeService } from "./services/tree.service";
import { TreeRepository } from "./infra/tree.repository";
import { TreeController } from "./api/tree.controller";
import { Module } from "@nestjs/common";

@Module({
	controllers: [TreeController],
	providers: [TreeService, TreeRepository],
	imports: [TypeOrmModule.forFeature([TreeEntity])],
	exports: [TreeService],
})
export class TreeModule {}
