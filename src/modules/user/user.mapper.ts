export function mapToUserWithRoles(user: Partial<UserType>) {
  const roles = (user.roles || []).map((userRole) => ({
    ...userRole,
    branch: userRole.branch?.name || null,
    role: userRole.role.name,
  }));

  return { ...user, roles };
}
