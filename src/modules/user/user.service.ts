import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { paginate, PaginateOptions } from "src/common/helpers/paginate";
import { PrismaService } from "src/prisma/prisma.service";
import { PaginationQueryDto } from "src/dtos/pagination-query.dto";
import { Prisma } from "prisma/client";
import { genSalt, hash } from "bcryptjs";
import { CreateUserDto, UpdateUserDto } from "./user.dto";
import { mapToUserWithRoles } from "./user.mapper";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: UserType, dto: CreateUserDto) {
    try {
      const existingUser = await this.prisma.user.findFirst({
        where: { tenant_id: user.tenant_id, email: { equals: dto.email, mode: "insensitive" } },
      });

      if (existingUser) {
        throw new ConflictException({ validation: { email: "Email already registered." } });
      }

      const role = await this.prisma.role.findFirst({ where: { id: dto.role_id } });

      if (!role) {
        throw new BadRequestException({
          validation: { role_id: "Invalid role." },
        });
      }

      const branch = await this.prisma.branch.findFirst({
        where: { id: dto.branch_id, tenant_id: user.tenant_id },
      });

      if (!branch) {
        throw new BadRequestException({ validation: { branch_id: "Invalid branch." } });
      }

      const salt = await genSalt(10);
      const hashedPassword = await hash(dto.password, salt);

      return await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            name: dto.name,
            email: dto.email,
            password: hashedPassword,
            tenant: { connect: { id: user.tenant_id } },
          },
        });

        await tx.userRole.create({
          data: {
            role: { connect: { id: role.id } },
            user: { connect: { id: newUser.id } },
            branch: { connect: { id: branch.id } },
          },
        });

        return newUser;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  findAll(user: UserType, paginationQuery: PaginationQueryDto) {
    const args: Prisma.UserFindManyArgs = {
      where: { tenant_id: user.tenant_id },
      select: {
        id: true,
        name: true,
        email: true,
        roles: { include: { branch: true, role: true } },
        created_at: true,
      },
    };

    const options: PaginateOptions = {
      searchFields: ["name", "email"],
      ...paginationQuery,
    };

    return paginate(this.prisma.user, args, options, mapToUserWithRoles);
  }

  async findOne(id: string, user: UserType) {
    try {
      const result = await this.prisma.user.findFirst({
        where: { id, tenant_id: user.tenant_id },
        include: {
          roles: {
            include: {
              branch: true,
              role: true,
            },
          },
        },
      });

      if (!result) {
        throw new NotFoundException("User not found.");
      }

      return mapToUserWithRoles(result);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
