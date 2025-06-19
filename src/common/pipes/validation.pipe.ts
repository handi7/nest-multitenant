import { Injectable, BadRequestException, PipeTransform, ArgumentMetadata } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

@Injectable()
export class CustomValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
      stopAtFirstError: false,
    });

    if (errors.length > 0) {
      throw new BadRequestException({
        message: "Validation failed",
        validation: this.formatErrors(errors),
      });
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: any[]) {
    return errors.flatMap((error) => this.mapValidationError(error));
  }

  private mapValidationError(error: any, parentPath = ""): any {
    const path = parentPath ? `${parentPath}.${error.property}` : error.property;

    let current = null;
    if (error.constraints) {
      current = {
        field: path,
        message: Object.values(error.constraints).join(" "),
      };
    }

    const children = (error.children || []).flatMap((child: any) =>
      this.mapValidationError(child, path),
    );

    if (current) return [current, ...this.formatErrors(children)];
    return children;
  }
}
