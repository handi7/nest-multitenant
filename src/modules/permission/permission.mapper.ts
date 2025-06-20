import { Permission } from "prisma/client";

export interface PermissionItem {
  id: string;
  name: string;
  label: string;
}

export function mapPermissionsByCategory(permissions: Permission[]) {
  const result = permissions.reduce(
    (acc, permission) => {
      const [category, action] = permission.name.split("_");

      const permissionItem: PermissionItem = {
        id: permission.id,
        name: permission.name,
        label: `${action} ${category}`,
      };

      if (!acc[category]) {
        acc[category] = {
          category,
          items: [permissionItem],
        };
      } else {
        acc[category].items.push(permissionItem);
      }

      return acc;
    },
    {} as Record<string, { category: string; items: PermissionItem[] }>,
  );

  return Object.values(result);
}
