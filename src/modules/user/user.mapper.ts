import { UserDto } from "src/dtos/user.dto";

export function mapToUserWithRoles(user: UserDto) {
  const roles = (user.roles || []).map((userRole) => ({
    ...userRole,
    branch: userRole.branch?.name || null,
    role: userRole.role.name,
  }));

  return { ...user, roles };
}
