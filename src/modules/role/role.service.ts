import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma } from "prisma/client";
import { CreateRoleDto, UpdateRoleDto } from "./role.dto";

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: UserType, dto: CreateRoleDto) {
    try {
      if (dto.name.toLowerCase() === "owner") {
        throw new BadRequestException("Cannot create owner role.");
      }

      const role = await this.prisma.role.findFirst({
        where: { name: { equals: dto.name, mode: "insensitive" }, tenant_id: user.tenant_id },
      });

      if (role) {
        throw new ConflictException("Role already exist.");
      }

      const permissions = await this.prisma.permission.findMany();

      const invalidPermissions = dto.permissions.filter((id) => {
        return !permissions.some((permission) => permission.id === id);
      });

      if (invalidPermissions.length) {
        throw new BadRequestException(
          `(${invalidPermissions.join(", ")}) ${invalidPermissions.length > 1 ? "are" : "is"} invalid permission(s)`,
        );
      }

      const createdRole = await this.prisma.role.create({
        data: {
          name: dto.name,
          tenant: { connect: { id: user.tenant_id } },
          permissions: {
            create: dto.permissions.map((id) => ({ permission: { connect: { id } } })),
          },
        },
        include: { permissions: { include: { permission: true } } },
      });

      return createdRole;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async findAll(user: UserType) {
    try {
      const res = await this.prisma.role.findMany({
        where: { tenant_id: user.tenant_id, deleted_at: null },
        include: { _count: true },
      });

      return res;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async findOne(id: string) {
    try {
      const role = await this.prisma.role.findFirst({
        where: { id, deleted_at: null },
        include: {
          user_roles: {
            include: { user: { select: { id: true, name: true, email: true, created_at: true } } },
          },
          permissions: { include: { permission: true } },
        },
      });

      if (!role) {
        throw new NotFoundException("Role not found.");
      }

      return role;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async update(user: UserType, id: string, dto: UpdateRoleDto) {
    try {
      if (!dto.name && !dto.permissions) {
        throw new BadRequestException("At least one field must be provided.");
      }

      const existingRole = await this.prisma.role.findFirst({
        where: { id, tenant_id: user.tenant_id, deleted_at: null },
        include: { permissions: true },
      });

      if (!existingRole) {
        throw new NotFoundException("Role not found.");
      }

      const isOwner = existingRole.name.toLowerCase() === "owner";
      const isRename = dto?.name?.toLowerCase() !== existingRole.name.toLowerCase();

      if (isOwner) {
        throw new BadRequestException({ validation: { name: "Cannot edit owner role." } });
      }

      // Cek duplicate name
      if (dto.name && isRename) {
        const duplicate = await this.prisma.role.findFirst({
          where: {
            name: { equals: dto.name, mode: "insensitive" },
            tenant_id: user.tenant_id,
            NOT: { id },
          },
        });

        if (duplicate) {
          throw new ConflictException({ validation: { name: "Role name already exists." } });
        }
      }

      // Validasi permission
      const allPermissions = await this.prisma.permission.findMany();
      const invalidPermissions = dto.permissions?.filter(
        (id) => !allPermissions.some((p) => p.id === id),
      );

      if (invalidPermissions?.length) {
        throw new BadRequestException(
          `(${invalidPermissions.join(", ")}) ${
            invalidPermissions.length > 1 ? "are" : "is"
          } invalid permission(s)`,
        );
      }

      const data: Prisma.RoleUpdateInput = {
        ...(dto.name && { name: dto.name }),
        ...(dto.permissions && {
          permissions: {
            deleteMany: {},
            create: dto.permissions.map((id) => ({
              permission: { connect: { id } },
            })),
          },
        }),
      };

      // Update role + replace permission
      const updated = await this.prisma.role.update({
        where: { id },
        data,
        include: { permissions: { include: { permission: true } } },
      });

      return updated;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async remove(user: UserType, id: string) {
    try {
      const role = await this.prisma.role.findFirst({
        where: { id, tenant_id: user.tenant_id },
        include: { _count: true },
      });

      if (!role) {
        throw new NotFoundException("Role not found.");
      }

      if (role.name.toLowerCase() === "owner") {
        throw new BadRequestException("Cannot delete owner role.");
      }

      if (role._count.user_roles) {
        throw new BadRequestException("Role is still assigned to users.");
      }

      if (role.deleted_at) {
        throw new BadRequestException("Role is already deleted.");
      }

      return await this.prisma.role.update({ where: { id }, data: { deleted_at: new Date() } });
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
