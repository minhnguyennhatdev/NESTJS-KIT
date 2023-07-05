import { UserRepository } from '@modules/user/user.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findOneCached() {
    const data1 = await this.userRepository.findBatchedAndCached({
      id: 1,
    });
    const data2 = await this.userRepository.findBatchedAndCached({
      id: 2,
    });
    const data3 = await this.userRepository.findBatchedAndCached({
      id: 3,
    });
    const data4 = await this.userRepository.findBatchedAndCached({
      id: 4,
    });
    const data5 = await this.userRepository.findBatchedAndCached({
      id: 5,
    });
    return { data1, data2, data3, data4, data5 };
  }
}
