import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from "@nestjs/common";
import { RoleService } from "./role.service";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionEnum } from "prisma/client";
import { CreateRoleDto, UpdateRoleDto } from "./role.dto";

@Controller()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post("role")
  @Permissions(PermissionEnum.role_create)
  create(@Req() req: AppRequest, @Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(req.user, createRoleDto);
  }

  @Get("roles")
  @Permissions(PermissionEnum.role_view)
  findAll(@Req() req: AppRequest) {
    return this.roleService.findAll(req.user);
  }

  @Get("role/:id")
  @Permissions(PermissionEnum.role_view)
  findOne(@Param("id") id: string) {
    return this.roleService.findOne(id);
  }

  @Patch("role/:id")
  @Permissions(PermissionEnum.role_edit)
  update(@Req() req: AppRequest, @Param("id") id: string, @Body() dto: UpdateRoleDto) {
    console.log({ dto });

    return this.roleService.update(req.user, id, dto);
  }

  @Delete("role/:id")
  @Permissions(PermissionEnum.role_delete)
  remove(@Req() req: AppRequest, @Param("id") id: string) {
    return this.roleService.remove(req.user, id);
  }
}
