import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

export class Pipe {
  public static parseStringToNumber(value: string) {
    return Number(value);
  }

  public static parseStringToFloat(value: string) {
    return parseFloat(value);
  }

  public static parseStringToBoolean(value: string): boolean {
    const check = Boolean(value);
    if (!check) return;
    return value === 'true';
  }

  public static checkStringIsNumber(value: string) {
    if (isNaN(Number(value))) {
      throw new BadRequestException('Id wrong, please check again!');
    }
    return value;
  }

  public static validateNumberInRange(
    value: number,
    from?: number,
    to?: number,
  ) {
    return !(value <= from || value >= to);
  }

  public static trimString(value?: string | number) {
    return String(value)?.trim();
  }

  public static lowerCaseString(value?: string | number) {
    return String(value)?.toLowerCase();
  }

  public static lowerCaseAndTrimString(value?: string | number) {
    return String(value)?.toLowerCase().trim();
  }

  public static upperCaseAndTrimString(value?: string | number) {
    return String(value)?.toUpperCase().trim();
  }

  public static toMongoObjectId({ value, key }): Types.ObjectId {
    if (
      Types.ObjectId.isValid(value) &&
      new Types.ObjectId(value).toString() === value
    ) {
      return new Types.ObjectId(value);
    } else {
      throw new BadRequestException(`${key} is not a valid MongoId`);
    }
  }
}
