import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { join } from 'path';
import {
  User, Tutor, Patient, MedicalRecord, Appointment,
  Notification, Invoice, InventoryItem,
} from './common/entities';
import { AuthModule } from './auth/auth.module';
import { TutorsModule } from './tutors/tutors.module';
import { PatientsModule } from './patients/patients.module';
import { RecordsModule } from './records/records.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AiModule } from './ai/ai.module';
import { NotificationsModule } from './notifications/notifications.module';
import { BillingModule } from './billing/billing.module';
import { InventoryModule } from './inventory/inventory.module';
import { ReportsModule } from './reports/reports.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { HealthController } from './health.controller';

const entities = [User, Tutor, Patient, MedicalRecord, Appointment, Notification, Invoice, InventoryItem];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Carga moderada: 120 requisições por minuto por IP
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    TypeOrmModule.forRoot(
      process.env.DATABASE_URL
        ? {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            entities,
            synchronize: true, // MVP; em produção madura, migrar para migrations
            ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
          }
        : {
            type: 'better-sqlite3',
            database: join(process.cwd(), 'vetcare.sqlite'),
            entities,
            synchronize: true,
          },
    ),
    AuthModule, TutorsModule, PatientsModule, RecordsModule, AppointmentsModule,
    AiModule, NotificationsModule, BillingModule, InventoryModule, ReportsModule, ChatbotModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
