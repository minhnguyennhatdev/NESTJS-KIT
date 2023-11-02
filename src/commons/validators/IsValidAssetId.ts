import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
@Injectable()
export class IsValidAssetIdProvider implements ValidatorConstraintInterface {
  async validate(value: string, { constraints }): Promise<boolean> {
    try {
      return constraints.includes(value);
    } catch (e) {
      return false;
    }
  }

  defaultMessage(): string {
    return `Invalid asset id`;
  }
}

export const IsValidAssetId =
  (values: any[]) => (object: any, propertyName: string) =>
    registerDecorator({
      name: `IsValidAssetId`,
      target: object.constructor,
      propertyName,
      validator: IsValidAssetIdProvider,
      constraints: values,
    });
