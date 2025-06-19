import { Request } from "express";
import { Permission, Role, RolePermission, User, UserRole } from "prisma/client";

export {};

declare global {
  interface UserType extends Partial<User> {
    roles?: (Partial<UserRole> & {
      role?: Partial<Role> & {
        permissions?: (Partial<RolePermission> & {
          permission?: Partial<Permission>;
        })[];
      };
      branch?: Branch | null;
    })[];
  }

  interface AppRequest extends Request {
    user?: UserType;
    branchId?: string;
    token?: string;
  }

  interface RedisSession {
    access_token: string;
    refresh_token: string;
  }
}
