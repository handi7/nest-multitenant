import { ConflictException, Injectable } from "@nestjs/common";
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

  findOne(id: number) {
    return `This action returns a #${id} branch`;
  }

  update(id: number, updateBranchDto: UpdateBranchDto) {
    return `This action updates a #${id} branch`;
  }

  remove(id: number) {
    return `This action removes a #${id} branch`;
  }
}
