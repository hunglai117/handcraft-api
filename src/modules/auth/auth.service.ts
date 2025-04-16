import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { CreateUserRequestDto } from "../users/dto/create-user.dto";
import { User } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";
import { AuthPayload } from "./auth.type";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        return user;
      }

      return null;
    } catch {
      return null;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload: AuthPayload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    const token = this.jwtService.sign(payload);

    return {
      user,
      token,
    };
  }

  async register(CreateUserRequestDto: CreateUserRequestDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: CreateUserRequestDto.email },
    });

    if (existingUser) {
      throw new BadRequestException("Email already exists");
    }

    const user = await this.usersService.create(CreateUserRequestDto);
    const payload: AuthPayload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    const token = this.jwtService.sign(payload);

    return {
      user,
      token,
    };
  }
}
