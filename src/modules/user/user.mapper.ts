export function mapToUserWithRoles(user: Partial<UserType>) {
  const roles = (user.roles || []).map(({ role, branch, ...userRole }) => ({
    ...userRole,
    branch_name: branch?.name || null,
    role_name: role.name,
  }));

  return { ...user, roles };
}
