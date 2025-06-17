import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { SeederService } from "./seeder.service";
import { PermissionSeeder } from "./permission.seeder";

@Module({
  imports: [PrismaModule],
  providers: [SeederService, PermissionSeeder],
})
export class SeederModule {}
