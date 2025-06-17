import { User, UserRole, Role, RolePermission, Permission, Branch } from "prisma/client";

export interface UserDto extends User {
  roles: (UserRole & {
    role: Role & {
      permissions: (RolePermission & {
        permission: Permission;
      })[];
    };
    branch?: Branch | null;
  })[];
}
