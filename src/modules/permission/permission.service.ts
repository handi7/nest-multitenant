import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { mapPermissionsByCategory } from "./permission.mapper";

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      const res = await this.prisma.permission.findMany();

      return mapPermissionsByCategory(res);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
