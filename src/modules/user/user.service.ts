import { UserRepository } from '@modules/user/user.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findOneCached() {
    const data1 = this.userRepository.findBatched({
      id: 1,
    });
    const data2 = this.userRepository.findBatched({
      name: '2',
    });
    const data3 = this.userRepository.findBatched({
      id: 3,
    });
    const data4 = this.userRepository.findBatched({
      id: 4,
    });
    const data5 = this.userRepository.findBatched({
      id: 5,
    });

    const random = { 0: data1, 1: data2, 2: data3, 3: data4, 4: data5 };
    return random[Math.floor(Math.random() * 4) + 1];
  }
}
