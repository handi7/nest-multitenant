import { Controller, Get, Post, Body, Param, Req, Query } from "@nestjs/common";
import { UserService } from "./user.service";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionEnum } from "prisma/client";
import { PaginationQueryDto } from "src/dtos/pagination-query.dto";
import { CreateUserDto } from "./user.dto";

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("user")
  @Permissions(PermissionEnum.user_create)
  create(@Req() req: AppRequest, @Body() dto: CreateUserDto) {
    return this.userService.create(req.user, dto);
  }

  @Get("users")
  @Permissions(PermissionEnum.user_view)
  findAll(@Req() req: AppRequest, @Query() query: PaginationQueryDto) {
    return this.userService.findAll(req.user, query);
  }

  @Get("user/:id")
  @Permissions(PermissionEnum.user_view)
  findOne(@Param("id") id: string, @Req() req: AppRequest) {
    return this.userService.findOne(id, req.user);
  }
}
