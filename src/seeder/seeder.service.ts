import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { PermissionSeeder } from "./permission.seeder";

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);
  private isSeeded = false;

  constructor(private readonly permissionSeeder: PermissionSeeder) {}

  async onApplicationBootstrap() {
    if (this.isSeeded) return;
    this.isSeeded = true;

    this.logger.log("...");
    this.logger.log("================= RUNNING SEEDERS =================");

    await this.permissionSeeder.run();

    this.logger.log("================= SEEDERS COMPLETED =================");
    this.logger.log("...");
  }
}
