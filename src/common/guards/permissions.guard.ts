import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import { RequestDto } from "src/dtos/request.dto";
import { PermissionEnum } from "prisma/client";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request: RequestDto = context.switchToHttp().getRequest();
    const user = request.user;
    const branchId = request.branchId ?? null;

    if (!user) throw new ForbiddenException("Unauthorized");

    const userRoles = user.roles.filter(
      (ur) => ur.deleted_at === null && (ur.branch_id === branchId || ur.branch_id === null),
    );

    const userPermissions = userRoles
      .flatMap((ur) => ur.role.permissions ?? [])
      .map((rp) => rp.permission?.name)
      .filter((name) => !!name);

    const hasPermission = requiredPermissions.every((perm) =>
      userPermissions.includes(perm as PermissionEnum),
    );

    if (!hasPermission) {
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }
}
