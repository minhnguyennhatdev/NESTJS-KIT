import { IDemoService } from '@modules/demo/demo.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AnotherDemoServiceImplement implements IDemoService {
  helloWorld(): string {
    return 'Wrong implement for testing failed';
  }
}
