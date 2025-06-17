import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { RedisModule } from "./redis/redis.module";
import { SeederModule } from "./seeder/seeder.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => process.env],
    }),
    PrismaModule,
    RedisModule,
    SeederModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
