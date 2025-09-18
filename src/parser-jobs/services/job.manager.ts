import { Injectable } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { Worker, MessageChannel, MessagePort } from "worker_threads";
import { FileQueueRepo } from "../infra/queue.repo";
import { join } from "path";
import { ParsedFileRepo } from "../infra/parsedfile.repo";
import { ParsingJobResponse } from "./workers/parsing.response";

@Injectable()
export class ParsingJobManager {
	private readonly logger = new Logger(ParsingJobManager.name);
	private worker: Worker | null = null;
	private workerPort: MessagePort | null = null;

	constructor(
		private readonly queueRepo: FileQueueRepo,
		private readonly parsedFileRepo: ParsedFileRepo,
	) {}

	async onModuleInit(): Promise<void> {
		await this.startWorker();
		await this.initQueue();
	}

	private async startWorker(): Promise<void> {
		if (this.worker !== null) {
			return;
		}

		const channel = new MessageChannel();
		this.workerPort = channel.port1;

		this.worker = new Worker(join(__dirname, "workers/parsing.worker.js"), {
			workerData: {
				ports: [channel.port2],
			},
			transferList: [channel.port2],
		});

		await new Promise<void>((resolve, reject) => {
			this.worker?.once("message", (msg) => {
				if (msg === "ready") {
					resolve();
				} else {
					reject(new Error(`Worker failed to start: ${msg}`));
				}
			});
		});
	}

	private async initQueue(): Promise<void> {
		await this.queueRepo.worker(async (fileId) => {
			const resp = await new Promise<ParsingJobResponse>((resolve, reject) => {
				this.workerPort?.postMessage({ fileId: fileId });
				this.workerPort?.once("message", (msg) => {
					resolve(msg);
				});
			});

			switch (resp.status) {
				case "success":
					await this.parsedFileRepo
						.save(resp.response!)
						.catch((err) =>
							this.logger.error(
								`Failed to save parsed file ${resp.fileId}: ${err}`,
							),
						);
					break;
				case "error":
					this.logger.error(
						`Failed job to parse file ${resp.fileId}: ${resp.error}`,
					);
					break;
			}
		});
	}

	async enqueue(fileId: string): Promise<void> {
		await this.queueRepo.enqueue(fileId);
	}
}
