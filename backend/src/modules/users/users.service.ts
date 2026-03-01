import { UsersRepository } from './users.repository';
import { UpdateProfileDTO, UserProfile, UserStats } from './users.types';
import { NotFoundError } from '../../utils/errors';

export class UsersService {
  constructor(private readonly usersRepo: UsersRepository) {}

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async getProfileByUsername(username: string): Promise<UserProfile> {
    const user = await this.usersRepo.findByUsername(username);
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileDTO): Promise<UserProfile> {
    const user = await this.usersRepo.updateProfile(userId, data);
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async getUserStats(userId: string): Promise<UserStats> {
    return this.usersRepo.getUserStats(userId);
  }

  async deleteAccount(userId: string): Promise<void> {
    await this.usersRepo.deleteUser(userId);
  }
}
