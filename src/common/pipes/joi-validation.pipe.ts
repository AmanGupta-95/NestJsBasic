import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import type { ObjectSchema } from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any) {
    const result = this.schema.validate(value, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (result.error) {
      const errorMessages = result.error.details.map(
        (detail) => detail.message,
      );
      throw new BadRequestException({
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result.value;
  }
}
