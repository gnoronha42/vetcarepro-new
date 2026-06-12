import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItem } from '../common/entities';
import { InventoryController } from './inventory.controller';

@Module({ imports: [TypeOrmModule.forFeature([InventoryItem])], controllers: [InventoryController] })
export class InventoryModule {}
