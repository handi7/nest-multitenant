import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from "@nestjs/common";
import { UserService } from "./user.service";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionEnum } from "prisma/client";
import { RequestDto } from "src/dtos/request.dto";
import { PaginationQueryDto } from "src/dtos/pagination-query.dto";
import { CreateUserDto } from "./user.dto";

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("user")
  @Permissions(PermissionEnum.user_create)
  create(@Req() req: RequestDto, @Body() dto: CreateUserDto) {
    return this.userService.create(req.user, dto);
  }

  @Get("users")
  @Permissions(PermissionEnum.user_view)
  findAll(@Req() req: RequestDto, @Query() query: PaginationQueryDto) {
    return this.userService.findAll(req.user, query);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
