import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { EmailNotificationService } from 'src/notifications/email.notification.service';
import { UnitModule } from 'src/unit/unit.module';
import { TokenDetails } from 'src/utills/token_details';
import { AssignedESsController } from './assignedES.controller';
import { AssignedES } from './assignedES.entity';
import { AssignedESService } from './assignedES.service';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [    
    TypeOrmModule.forFeature([User, AssignedES]),
    UnitModule,
    AuthModule,
  ],
  providers: [UsersService, EmailNotificationService,TokenDetails, AssignedESService],
  controllers: [UsersController, AssignedESsController],
  exports: [UsersService],
})
export class UsersModule {}
