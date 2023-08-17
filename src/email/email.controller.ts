import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmailService } from './email.service';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { EmailNotificationService } from 'src/notifications/email.notification.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService,
    private readonly emaiService: EmailNotificationService,) {}

  @Post()
  async create(@Body() createEmailDto: CreateEmailDto) {
console.log("email",createEmailDto )
var template =
''+
'<br/>Name: ' +
createEmailDto.name +
'<br/>Email: ' +
createEmailDto.email +
' <br/>Phone: ' +
createEmailDto.phone +
' <br/>Message: ' +
createEmailDto.message 


;

// sned email with new password
let resemail= await this.emaiService.sendMailfromLanding(
'info@climatesi.com',
'Massege from SCC v2 contact from form',
'',
template,
);
    return resemail ;
  }


}
