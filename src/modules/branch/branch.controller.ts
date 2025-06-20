import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from "@nestjs/common";
import { BranchService } from "./branch.service";
import { CreateBranchDto, UpdateBranchDto } from "./branch.dto";

@Controller()
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post("branch")
  create(@Req() req: AppRequest, @Body() createBranchDto: CreateBranchDto) {
    return this.branchService.create(req.user, createBranchDto);
  }

  @Get("branches")
  findAll(@Req() req: AppRequest) {
    return this.branchService.findAll(req.user);
  }

  @Get("branch/:id")
  findOne(@Param("id") id: string) {
    return this.branchService.findOne(+id);
  }

  @Patch("branch/:id")
  update(@Param("id") id: string, @Body() updateBranchDto: UpdateBranchDto) {
    return this.branchService.update(+id, updateBranchDto);
  }

  @Delete("branch/:id")
  remove(@Param("id") id: string) {
    return this.branchService.remove(+id);
  }
}
