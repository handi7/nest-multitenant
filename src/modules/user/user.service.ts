import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { paginate, PaginateOptions } from "src/common/helpers/paginate";
import { PrismaService } from "src/prisma/prisma.service";
import { UserDto } from "src/dtos/user.dto";
import { PaginationQueryDto } from "src/dtos/pagination-query.dto";
import { Prisma } from "prisma/client";
import { genSalt, hash } from "bcryptjs";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: UserDto, dto: CreateUserDto) {
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

  findAll(user: UserDto, paginationQuery: PaginationQueryDto) {
    const args: Prisma.UserFindManyArgs = {
      where: { tenant_id: user.tenant_id },
      select: {
        id: true,
        name: true,
        email: true,
        roles: { include: { role: true } },
        created_at: true,
      },
    };

    const options: PaginateOptions = {
      searchFields: ["name", "email"],
      ...paginationQuery,
    };

    return paginate(this.prisma.user, args, options);
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
