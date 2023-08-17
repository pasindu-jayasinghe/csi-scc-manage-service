import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './strategies/jwt.strategy';
import { HttpModule } from '@nestjs/axios';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/roles.guard';


@Module({
  controllers:[],
  imports:[        
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.JWT_expiresIn },
    }),
    HttpModule
  ],
  providers: [AuthService, {provide:APP_GUARD, useClass: JwtStrategy}, {provide: APP_GUARD,useClass: RolesGuard}],
  exports: [AuthService]
})
export class AuthModule {}
