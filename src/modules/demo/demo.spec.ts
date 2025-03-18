import { Test, TestingModule } from '@nestjs/testing';
import { DemoService } from '@modules/demo/demo.service';
import { IDemoService } from '@modules/demo/demo.interface';

describe('DemoService', () => {
  let demoService: IDemoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DemoService],
    }).compile();

    demoService = module.get<IDemoService>(IDemoService);
  });

  it('DemoService is defined', () => {
    expect(demoService).toBeDefined();
  });

  describe('Testing DemoService', () => {
    it('Testing helloWorld', () => {
      expect(demoService.helloWorld()).toBe('Hello World!');
    });
  });
});
