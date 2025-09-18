import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { DatabaseStringService } from "../database/db/database.string";
import { ParsingController } from "./api/jobs.controller";
import { FileQueueRepo } from "./infra/queue.repo";
import { ParsingJobManager } from "./services/job.manager";
import { ParsedFileRepo } from "./infra/parsedfile.repo";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ParsedFileEntity } from "./infra/parsedfile.entity";

@Module({
	imports: [DatabaseModule, TypeOrmModule.forFeature([ParsedFileEntity])],
	providers: [
		{
			provide: "PG_BOSS",
			useFactory: async (strService: DatabaseStringService) => {
				const PgBoss = require("pg-boss");
				const boss = new PgBoss({
					connectionString: strService.getString(),
					max: 1,
				});
				await boss.start();
				return boss;
			},
			inject: [DatabaseStringService],
		},
		ParsingJobManager,
		FileQueueRepo,
		ParsedFileRepo,
	],
	controllers: [ParsingController],
})
export class ParsingJobModule {}
