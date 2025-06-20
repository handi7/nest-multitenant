import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RoleSeeder {
  private readonly logger = new Logger("RoleSeeder");

  constructor(private readonly prisma: PrismaService) {}

  async run() {
    this.logger.log("================= ROLE SEEDER START =================");

    const allPermissions = await this.prisma.permission.findMany();

    if (allPermissions.length === 0) {
      this.logger.warn("No permissions found in database.");
      return;
    }

    const ownerRoles = await this.prisma.role.findMany({
      where: { name: "Owner" },
      include: {
        permissions: {
          include: { permission: true }, // Ambil name dari Permission
        },
      },
    });

    if (ownerRoles.length === 0) {
      this.logger.warn("No 'Owner' roles found.");
      return;
    }

    for (const role of ownerRoles) {
      const existingPermissionIds = new Set(role.permissions.map((rp) => rp.permission_id));

      const missingPermissions = allPermissions.filter(
        (perm) => !existingPermissionIds.has(perm.id),
      );

      if (missingPermissions.length === 0) {
        this.logger.log(`✅ Role '${role.name}' (id: ${role.id}) already has all permissions.`);
        continue;
      }

      await this.prisma.role.update({
        where: { id: role.id },
        data: {
          permissions: {
            createMany: {
              data: missingPermissions.map((perm) => ({
                permission_id: perm.id,
              })),
              skipDuplicates: true,
            },
          },
        },
      });

      this.logger.log(
        `🔧 Added ${missingPermissions.length} missing permissions to role '${role.name}' (id: ${role.id}).`,
      );
    }

    this.logger.log("================= ROLE SEEDER END =================");
  }
}
