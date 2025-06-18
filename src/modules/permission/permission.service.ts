import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      const res = await this.prisma.permission.findMany();

      const result = res.reduce((acc, permission) => {
        const [category, action] = permission.name.split("_");

        const permissionItem = {
          id: permission.id,
          name: permission.name,
          label: `${action} ${category}`,
        };

        if (!acc[category]) {
          acc[category] = {
            category,
            items: [permissionItem],
          };
        } else acc[category].items.push(permissionItem);

        return acc;
      }, {});

      return Object.values(result);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
