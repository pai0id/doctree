import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class DatabaseStringService {
	constructor(private readonly configService: ConfigService) {}

	getString(): string {
		const username = this.configService.get("DB_USERNAME", "postgres");
		const password = this.configService.get("DB_PASSWORD", "postgres");
		const host = this.configService.get("DB_HOST", "localhost");
		const port = this.configService.get("DB_PORT", 5432);
		const database = this.configService.get("DB_NAME", "nest_app");
		return `postgres://${username}:${password}@${host}:${port}/${database}`;
	}
}
