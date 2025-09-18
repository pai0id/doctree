import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";

@Injectable()
export class FileValidationPipe implements PipeTransform {
	transform(value: Express.Multer.File) {
		if (!value) {
			throw new BadRequestException("No file uploaded");
		}
		return value;
	}
}
