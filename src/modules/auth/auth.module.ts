import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EnvConfig } from "src/dtos/env-config.dto";
import { RedisModule } from "src/redis/redis.module";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (env: ConfigService<EnvConfig>) => ({
        secret: env.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: env.get<string>("JWT_EXPIRATION_TIME") },
      }),
    }),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
