import { Inject, Injectable } from "@nestjs/common";
import PgBoss, { JobWithMetadata } from "pg-boss";
import { Job } from "pg-boss";
import { EventEmitter } from "stream";

class FileJob {
	fileId: string;
}

@Injectable()
export class FileQueueRepo {
	private readonly queueName = "parsing-queue";
	private queueReady: Promise<void>;

	constructor(@Inject("PG_BOSS") private readonly boss: PgBoss) {
		this.queueReady = new Promise((resolve, reject) => {
			this.boss
				.getQueue(this.queueName)
				.then((queue) => {
					if (queue === null) {
						this.boss
							.createQueue(this.queueName, {
								policy: "singleton",
								name: this.queueName,
							})
							.then(() => {
								resolve();
							})
							.catch((err) => {
								reject(err);
							});
					} else {
						resolve();
					}
				})
				.catch((err) => {
					reject(err);
				});
		});
	}

	async enqueue(fileId: string): Promise<void> {
		await this.queueReady;
		const job = await this.boss.getJobById(this.queueName, fileId);
		if (job === null) {
			await this.boss.send(this.queueName, { fileId: fileId }, { id: fileId });
		} else if (job.state !== "created" && job.state !== "active") {
			await this.boss.deleteJob(this.queueName, job.id);
			await this.boss.send(this.queueName, { fileId: fileId }, { id: fileId });
		}
	}

	async worker(workFn: (fileId: string) => Promise<void>): Promise<void> {
		await this.queueReady;
		this.boss.work(this.queueName, async (job: Job<FileJob>[]) => {
			for (const j of job) {
				await workFn(j.data.fileId);
			}
		});
	}

	async dequeue(fileId: string): Promise<void> {
		await this.queueReady;
		const job: JobWithMetadata<FileJob> | null = await this.boss.getJobById(
			this.queueName,
			fileId,
		);
		if (job !== null || (job!.state !== "created" && job!.state !== "active")) {
			await this.boss.deleteJob(this.queueName, job!.id);
		}
	}
}
