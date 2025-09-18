import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ParseFileResponse {
	@ApiProperty({ description: "File id" })
	fileId: string;

	@ApiProperty({ description: "File text" })
	text: string;

	@ApiProperty({ description: "File MIME type" })
	mimeType: string;

	@ApiProperty({
		description: "What percentage of the file was parsed to text",
	})
	parsePercentage: number;

	@ApiPropertyOptional({ description: "Comment about the parsing process" })
	parseComment?: string;
}
