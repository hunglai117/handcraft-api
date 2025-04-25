import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserProvider, ProviderType } from "./entities/user-provider.entity";
import { User } from "./entities/user.entity";

@Injectable()
export class UserProviderService {
  constructor(
    @InjectRepository(UserProvider)
    private userProviderRepository: Repository<UserProvider>,
  ) {}

  async findByProviderId(
    provider: ProviderType,
    providerId: string,
  ): Promise<UserProvider | null> {
    return this.userProviderRepository.findOne({
      where: { provider, providerId },
      relations: ["user"],
    });
  }

  async create(
    user: User,
    provider: ProviderType,
    providerId: string,
    providerData?: Record<string, any>,
  ): Promise<UserProvider> {
    const userProvider = this.userProviderRepository.create({
      user,
      userId: user.id,
      provider,
      providerId,
      providerData,
    });

    return this.userProviderRepository.save(userProvider);
  }

  async update(id: string, data: Partial<UserProvider>): Promise<UserProvider> {
    await this.userProviderRepository.update(id, data);
    return this.userProviderRepository.findOne({ where: { id } });
  }

  async findAllByUserId(userId: string): Promise<UserProvider[]> {
    return this.userProviderRepository.find({
      where: { userId },
    });
  }

  async remove(id: string): Promise<void> {
    await this.userProviderRepository.delete(id);
  }
}
