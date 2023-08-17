import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { EmailNotificationService } from 'src/notifications/email.notification.service';

@Module({
  controllers: [EmailController],
  providers: [EmailService,EmailNotificationService]
})
export class EmailModule {}
