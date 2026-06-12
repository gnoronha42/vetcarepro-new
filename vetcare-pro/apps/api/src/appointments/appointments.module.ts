import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment, Patient, Notification } from '../common/entities';
import { AppointmentsController } from './appointments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Patient, Notification])],
  controllers: [AppointmentsController],
})
export class AppointmentsModule {}
