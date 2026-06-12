import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient, Tutor } from '../common/entities';
import { PatientsController } from './patients.controller';

@Module({ imports: [TypeOrmModule.forFeature([Patient, Tutor])], controllers: [PatientsController] })
export class PatientsModule {}
