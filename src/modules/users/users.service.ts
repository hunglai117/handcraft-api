import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { PaginationQueryDto } from "../shared/dtos/pagination.dto";
import { CreateUserRequestDto } from "./dto/create-user.dto";
import { UpdateProfileRequestDto } from "./dto/update-profile.dto";
import { User } from "./entities/user.entity";
import { PaginatedUserResponseDto } from "./dto/get-all-user.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(CreateUserRequestDto: CreateUserRequestDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: CreateUserRequestDto.email },
    });

    if (existingUser) {
      throw new ConflictException("Email already exists");
    }

    const user = this.userRepository.create(CreateUserRequestDto);

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);

    return this.userRepository.save(user);
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedUserResponseDto> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: "DESC" },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items: users,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileRequestDto,
  ): Promise<User> {
    const user = await this.findById(userId);
    Object.assign(user, updateProfileDto);

    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.remove(user);
  }
}
