import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { compareSync, genSalt, hash } from "bcryptjs";
import { LoginDto } from "./dto/login.dto";
import { JwtService } from "@nestjs/jwt";
import { RedisService } from "src/redis/redis.service";
import { mapToUserWithRolesAndPermissions } from "../user/user.mapper";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      const email = dto.email.toLowerCase();

      const user = await this.prisma.user.findFirst({
        where: {
          email: { equals: email, mode: "insensitive" },
        },
      });

      if (user) {
        throw new ConflictException({
          validation: { email: "Email already registered" },
        });
      }

      const tenant = await this.prisma.tenant.findFirst({
        where: { name: { equals: dto.tenant_name, mode: "insensitive" } },
      });

      if (tenant) {
        throw new ConflictException({
          validation: { tenant_name: "Tenant name is not available" },
        });
      }

      const salt = await genSalt(10);
      const hashedPassword = await hash(dto.password, salt);

      const { createdUser } = await this.prisma.$transaction(async (tx) => {
        const createdTenant = await tx.tenant.create({
          data: { name: dto.tenant_name },
        });

        const createdUser = await tx.user.create({
          data: {
            name: dto.name,
            email,
            password: hashedPassword,
            tenant: { connect: { id: createdTenant.id } },
          },
          select: {
            id: true,
            name: true,
            email: true,
            tenant: true,
            roles: true,
            created_at: true,
            updated_at: true,
          },
        });

        const role = await tx.role.create({
          data: {
            name: "Owner",
            tenant: { connect: { id: createdTenant.id } },
          },
        });

        const permissions = await tx.permission.findMany();
        const rolePermissionsToInsert = permissions.map((item) => ({
          permission_id: item.id,
          role_id: role.id,
        }));

        await tx.rolePermission.createManyAndReturn({ data: rolePermissionsToInsert });

        const userRole = await tx.userRole.create({
          data: {
            user: { connect: { id: createdUser.id } },
            role: { connect: { id: role.id } },
          },
          include: {
            role: { include: { permissions: { include: { permission: true } } } },
            branch: true,
          },
        });

        createdUser.roles = [...createdUser.roles, userRole];

        return { createdTenant, createdUser };
      });

      return { createdUser };
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { email: { equals: dto.email, mode: "insensitive" } },
        include: {
          tenant: true,
          roles: {
            include: {
              branch: true,
              role: {
                include: {
                  permissions: {
                    include: { permission: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!user || !compareSync(dto.password, user.password)) {
        throw new BadRequestException("Invalid credentials.");
      }

      const jwtPayload = {
        id: user.id,
        email: user.email,
        timestamp: new Date().toISOString(),
      };

      const access_token = this.jwtService.sign(jwtPayload, { expiresIn: "10h" });

      const refresh_token = this.jwtService.sign(
        { ...jwtPayload, isRefresh: true },
        { expiresIn: "7d" },
      );

      const redisValue = JSON.stringify({ access_token, refresh_token });
      const redisExp = 60 * 60 * 24 * 7; // 7 hari TTL
      await this.redis.set(`session:${user.id}`, redisValue, redisExp);

      if (user.roles.length === 1) {
        await this.redis.set(
          `session:${user.id}:branch`,
          user.roles[0]?.branch_id ?? null,
          redisExp,
        );
      }

      return { access_token, refresh_token, user: mapToUserWithRolesAndPermissions(user) };
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
