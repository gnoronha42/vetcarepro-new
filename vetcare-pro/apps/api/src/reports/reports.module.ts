import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient, Appointment, Invoice, InventoryItem, MedicalRecord, Tutor } from '../common/entities';
import { ReportsController } from './reports.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, Appointment, Invoice, InventoryItem, MedicalRecord, Tutor])],
  controllers: [ReportsController],
})
export class ReportsModule {}
