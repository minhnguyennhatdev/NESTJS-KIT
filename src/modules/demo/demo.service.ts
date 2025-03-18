import { DemoImplement } from '@modules/demo/demo.implement';
import { IDemoService } from '@modules/demo/demo.interface';
import { Provider } from '@nestjs/common';

export const DemoService: Provider = {
  provide: IDemoService,
  useClass: DemoImplement,
};
