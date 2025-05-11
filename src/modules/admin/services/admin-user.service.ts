import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { User, UserRole } from "../../users/entities/user.entity";

@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(role?: UserRole, page = 1, limit = 10) {
    const queryBuilder = this.userRepository.createQueryBuilder("user");

    if (role) {
      queryBuilder.where("user.role = :role", { role });
    }

    queryBuilder
      .orderBy("user.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.userRepository.findOneBy({ id });
  }

  async getUserStats() {
    // Get user registration counts by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const usersByMonth = await this.userRepository
      .createQueryBuilder("user")
      .select("DATE_TRUNC('month', user.createdAt)", "month")
      .addSelect("COUNT(user.id)", "count")
      .where("user.createdAt >= :sixMonthsAgo", { sixMonthsAgo })
      .groupBy("month")
      .orderBy("month", "ASC")
      .getRawMany();

    // Get user count by role
    const usersByRole = await this.userRepository
      .createQueryBuilder("user")
      .select("user.role", "role")
      .addSelect("COUNT(user.id)", "count")
      .groupBy("user.role")
      .getRawMany();

    // Get total user count
    const totalUsers = await this.userRepository.count();

    // Get new users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await this.userRepository.count({
      where: {
        createdAt: Between(thirtyDaysAgo, new Date()),
      },
    });

    return {
      totalUsers,
      newUsers,
      usersByRole,
      usersByMonth,
    };
  }

  async create(userData: Partial<User>) {
    const newUser = this.userRepository.create(userData);
    return this.userRepository.save(newUser);
  }

  async update(id: string | null, updateData: Partial<User>) {
    if (id) {
      // Update existing user
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }

      Object.assign(user, updateData);
      return this.userRepository.save(user);
    } else {
      // Create new user
      const newUser = this.userRepository.create(updateData);
      return this.userRepository.save(newUser);
    }
  }

  async remove(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    return this.userRepository.remove(user);
  }
}
