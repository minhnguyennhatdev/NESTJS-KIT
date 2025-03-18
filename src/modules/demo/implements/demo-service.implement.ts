import { IDemoService } from '@modules/demo/demo.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DemoServiceImplement implements IDemoService {
  helloWorld(): string {
    return 'Hello World!';
  }
}
