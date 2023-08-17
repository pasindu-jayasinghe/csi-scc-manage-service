import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Audit } from './audit_/entity/audit.entity';

import { DocumentModule } from './document/document.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { UsersModule } from './users/users.module';

import { MulterModule } from '@nestjs/platform-express';
import { EmissionModule } from './emission/emission.module';
import { ProjectModule } from './project/project.module';
import { UnitModule } from './unit/unit.module';
import { CountryModule } from './country/country.module';
import { AuthModule } from './auth/auth.module';
import { ParameterModule } from './parameter/parameter.module';
import { ReportModule } from './report/report.module';
import { SeaAirDistanceModule } from './sea-air-distance/sea-air-distance.module'; 
import { PortsModule } from './ports/ports.module';
import { ReportDataModule } from './report-data/report-data.module';
import { EmailModule } from './email/email.module';

import configuration from './configuration';
import { EquationLibController } from './verification/equation-lib/controller/equation-lib.controller';
import { EquationLibService } from './verification/equation-lib/service/equation-lib.service';
import { HttpModule } from '@nestjs/axios';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      load: [configuration],
      envFilePath: ['.env.development']
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const {
          host,
          port,
          database,
          username,
          password,
          type,
          synchronize,
          migrationsRun,
        } = configService.get('database');

        return {
          type,
          host,
          port,
          database,
          username,
          password,
          synchronize,
          migrationsRun,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
          cli: {
            migrationsDir: 'src/migrations',
          },
          cache:false,
          logging:true,
          logger: 'file',
        };
      },
      inject: [ConfigService],
    }),
    MulterModule.register({dest: './public'}),
    TypeOrmModule.forFeature([Audit]),
    DocumentModule,
    UsersModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '../static-files'),
      renderPath: 'icatcountryportal',
      exclude: ['/api*'],
      serveStaticOptions: { index: false },
    }),
    MailerModule.forRoot({
      transport: {
        // service: 'gmail',
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        //  ignoreTLS: true,

        auth: {
          user: 'no-reply-icat-ca-tool@climatesi.com',
          pass: 'ICAT2022tool',
          // user: "pradeep@climatesi.com",
          // pass: "RPpkr95#",
        },
        // 'smtp://janiya.rolfson49@ethereal.email:T8pnMS7xzzX7k3QSkM@ethereal.email',
      },
      defaults: {
        from: '"Admin" <no-reply-icat-ca-tool@climatesi.com>',
      },
    }),
    ServeStaticModule.forRoot({rootPath: join(__dirname, '..', 'public')}),
    EmissionModule,
    ProjectModule,
    UnitModule,
    CountryModule,
    AuthModule,    
    AuthModule,
    ParameterModule,
    ReportModule,    
    SeaAirDistanceModule,    
    PortsModule, 
    ReportDataModule, EmailModule,
HttpModule,
  ],
  controllers: [AppController, EquationLibController],
  providers: [AppService, EquationLibService],
  exports: [AppService]
})
export class AppModule {}
