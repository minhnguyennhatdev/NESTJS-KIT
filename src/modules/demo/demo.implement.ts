import { Injectable } from '@nestjs/common';

@Injectable()
export class DemoImplement {
  helloWorld(): string {
    return 'Hello World!';
  }
}
