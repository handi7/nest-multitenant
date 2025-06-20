export function mapToRoleWithPermissions(role: RoleType) {
  const permissions = role.permissions?.map(({ permission }) => permission.name) || [];
  return { ...role, permissions };
}
