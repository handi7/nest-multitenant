export function mapToUserWithRoles({ password: _, ...user }: UserType) {
  const roles = (user.roles || []).map(({ role, branch, ...userRole }) => ({
    ...userRole,
    branch_name: branch?.name || null,
    role_name: role.name,
  }));

  return { ...user, roles };
}

export function sanitizeUser({ password: _, ...user }: UserType) {
  return user;
}

export function mapToUserWithRolesAndPermissions({ password: _, ...user }: UserType) {
  const roles = (user.roles || []).map(({ role, branch, ...userRole }) => ({
    ...userRole,
    branch_name: branch?.name || null,
    role_name: role.name,
    permissions: role.permissions?.map(({ permission }) => permission.name) || [],
  }));

  return { ...user, roles };
}
