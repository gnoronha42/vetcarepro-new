import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecord, Patient } from '../common/entities';
import { RecordsController } from './records.controller';

@Module({ imports: [TypeOrmModule.forFeature([MedicalRecord, Patient])], controllers: [RecordsController] })
export class RecordsModule {}
