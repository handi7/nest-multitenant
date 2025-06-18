import { Controller, Get } from "@nestjs/common";
import { PermissionService } from "./permission.service";

@Controller()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get("permissions")
  findAll() {
    return this.permissionService.findAll();
  }
}
