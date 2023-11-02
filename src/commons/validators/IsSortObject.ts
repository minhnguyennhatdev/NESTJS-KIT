import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const SortValues = ['-1', '1', 'asc', 'ascending', 'desc', 'descending'];

@ValidatorConstraint()
@Injectable()
export class IsSortObjectProvider implements ValidatorConstraintInterface {
  async validate(value: Record<any, any>): Promise<boolean> {
    try {
      return Object.values(value).every((v) => SortValues.includes(v));
    } catch (e) {
      return false;
    }
  }

  defaultMessage(args?: ValidationArguments): string {
    return `${args.property} value must in ${SortValues.toString()}`;
  }
}

export const IsSortObject = () => (object: any, propertyName: string) =>
  registerDecorator({
    name: `IsSortObject`,
    target: object.constructor,
    propertyName,
    validator: IsSortObjectProvider,
  });
