import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from "@nestjs/common";
import { BranchService } from "./branch.service";
import { CreateBranchDto, UpdateBranchDto } from "./branch.dto";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionEnum } from "prisma/client";

@Controller()
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post("branch")
  @Permissions(PermissionEnum.branch_create)
  create(@Req() req: AppRequest, @Body() createBranchDto: CreateBranchDto) {
    return this.branchService.create(req.user, createBranchDto);
  }

  @Get("branches")
  @Permissions(PermissionEnum.branch_view)
  findAll(@Req() req: AppRequest) {
    return this.branchService.findAll(req.user);
  }

  @Get("branch/:id")
  @Permissions(PermissionEnum.branch_view)
  findOne(@Param("id") id: string, @Req() req: AppRequest) {
    return this.branchService.findOne(id, req.user);
  }

  @Patch("branch/:id")
  @Permissions(PermissionEnum.branch_edit)
  update(@Param("id") id: string, @Body() dto: UpdateBranchDto, @Req() req: AppRequest) {
    return this.branchService.update(id, dto, req.user);
  }

  @Delete("branch/:id")
  remove(@Param("id") id: string, @Req() req: AppRequest) {
    return this.branchService.remove(id, req.user);
  }
}
