import { DemoServiceImplement } from '@modules/demo/implements/demo-service.implement';
import { IDemoService } from '@modules/demo/demo.interface';
import { Provider } from '@nestjs/common';
// import { AnotherDemoServiceImplement } from '@modules/demo˝/implements/another-demo-service.implement';

export const DemoService: Provider = {
  provide: IDemoService,
  useClass: DemoServiceImplement,

  /**
   * If you want to test the wrong implement, you can change the useClass to AnotherDemoServiceImplement
   */
  // useClass: AnotherDemoServiceImplement,
};
