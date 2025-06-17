import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { compareSync, genSalt, hash } from "bcryptjs";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

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

        const userRole = await tx.userRole.create({
          data: {
            user: { connect: { id: createdUser.id } },
            role: { connect: { id: role.id } },
          },
          include: { role: { include: { permissions: true } }, branch: true },
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
      });

      if (!user || !compareSync(dto.password, user.password)) {
        throw new BadRequestException("Invalid credentials.");
      }

      return user;
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
