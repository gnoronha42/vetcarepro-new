import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice, Tutor } from '../common/entities';
import { BillingController } from './billing.controller';

@Module({ imports: [TypeOrmModule.forFeature([Invoice, Tutor])], controllers: [BillingController] })
export class BillingModule {}
