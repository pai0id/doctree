import { parentPort, workerData } from "worker_threads";
import { ParseService } from "../../../text-parser/services/parse.service";
import { ParseFileRequest } from "../../../text-parser/services/requests/parse.request";
import { NestFactory } from "@nestjs/core";
import { DatabaseModule } from "../../../database/database.module";
import { ParseModule } from "../../../text-parser/parse.module";

class ParserWorker {
	private port: MessagePort;
	constructor(private readonly service: ParseService) {
		if (parentPort) {
			this.port = workerData.ports[0];

			this.port.onmessage = (msg) => {
				const parseReq: ParseFileRequest = msg.data;
				this.service
					.parseFile(parseReq)
					.then((resp) => {
						this.port.postMessage({
							status: "success",
							fileId: parseReq.fileId,
							response: resp,
						});
					})
					.catch((err) => {
						this.port.postMessage({
							status: "error",
							fileId: parseReq.fileId,
							error: err,
						});
					});
			};
			parentPort.postMessage("ready");
		}
	}
}

async function bootsrap() {
	const app = await NestFactory.createApplicationContext({
		providers: [ParseService],
		imports: [ParseModule, DatabaseModule],
		exports: [ParseService],
		module: ParseModule,
	});
	const appService = app.get<ParseService>(ParseService);

	const worker = new ParserWorker(appService);
}
bootsrap();
