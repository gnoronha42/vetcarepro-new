import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tutor } from '../common/entities';
import { TutorsController } from './tutors.controller';

@Module({ imports: [TypeOrmModule.forFeature([Tutor])], controllers: [TutorsController] })
export class TutorsModule {}
