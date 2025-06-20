import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateBranchDto, UpdateBranchDto } from "./branch.dto";
import { Prisma } from "prisma/client";
import { paginate } from "src/common/helpers/paginate";

@Injectable()
export class BranchService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: UserType, dto: CreateBranchDto) {
    try {
      const existingBranch = await this.prisma.branch.findFirst({
        where: {
          tenant_id: user.tenant_id,
          name: { equals: dto.name, mode: "insensitive" },
        },
      });

      if (existingBranch) {
        throw new ConflictException({
          validation: { name: "Branch already exists." },
        });
      }

      return await this.prisma.branch.create({
        data: { name: dto.name, tenant: { connect: { id: user.tenant_id } } },
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async findAll(user: UserType) {
    try {
      const args: Prisma.BranchFindManyArgs = {
        where: { tenant_id: user.tenant_id },
      };

      return await paginate(this.prisma.branch, args);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async findOne(id: string, user: UserType) {
    try {
      const branch = await this.prisma.branch.findUnique({
        where: { id, tenant_id: user.tenant_id },
      });

      if (!branch) {
        throw new NotFoundException("Branch not found.");
      }

      return branch;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async update(id: string, dto: UpdateBranchDto, user: UserType) {
    try {
      const branch = await this.prisma.branch.findUnique({
        where: { id, tenant_id: user.tenant_id },
      });

      if (!branch) {
        throw new NotFoundException("Branch not found.");
      }

      const existingBranch = await this.prisma.branch.findFirst({
        where: {
          tenant_id: user.tenant_id,
          name: { equals: dto.name, mode: "insensitive" },
          id: { not: id }, // Exclude current branch
        },
      });

      if (existingBranch) {
        throw new ConflictException({
          validation: { name: "Branch already exists." },
        });
      }

      return await this.prisma.branch.update({
        where: { id },
        data: { name: dto.name },
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async remove(id: string, user: UserType) {
    try {
      const branch = await this.prisma.branch.findUnique({
        where: { id, tenant_id: user.tenant_id },
      });

      if (!branch) {
        throw new NotFoundException("Branch not found.");
      }

      // Check if branch is used in any role
      const roleCount = await this.prisma.userRole.count({
        where: { branch_id: id },
      });

      if (roleCount > 0) {
        throw new BadRequestException("Branch cannot be deleted because it is used in roles.");
      }

      return await this.prisma.branch.update({
        where: { id },
        data: { deleted_at: new Date() },
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
