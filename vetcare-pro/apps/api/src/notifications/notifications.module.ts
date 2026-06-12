import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification, Tutor } from '../common/entities';
import { NotificationsController } from './notifications.controller';

@Module({ imports: [TypeOrmModule.forFeature([Notification, Tutor])], controllers: [NotificationsController] })
export class NotificationsModule {}
