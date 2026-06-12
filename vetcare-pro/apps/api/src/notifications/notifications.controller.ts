import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsIn, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { Notification, Tutor } from '../common/entities';
import { JwtAuthGuard } from '../auth/jwt.guard';

class NotificationDto {
  @IsOptional() @IsUUID() tutorId?: string;
  @IsString() @MinLength(2) title: string;
  @IsString() @MinLength(2) message: string;
  @IsOptional() @IsIn(['lembrete', 'vacina', 'retorno', 'financeiro', 'geral']) kind?: string;
  @IsOptional() @IsIn(['app', 'email', 'whatsapp']) channel?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    @InjectRepository(Notification) private repo: Repository<Notification>,
    @InjectRepository(Tutor) private tutors: Repository<Tutor>,
  ) {}

  @Get()
  list() { return this.repo.find({ order: { createdAt: 'DESC' }, take: 200 }); }

  @Post()
  async create(@Body() dto: NotificationDto) {
    const n = this.repo.create({ ...dto, channel: dto.channel || 'app' });
    if (dto.tutorId) n.tutor = await this.tutors.findOne({ where: { id: dto.tutorId } });
    return this.repo.save(n);
  }

  @Patch(':id/status')
  async setStatus(@Param('id') id: string, @Body('status') status: string) {
    if (!['pendente', 'enviada', 'lida'].includes(status)) status = 'enviada';
    await this.repo.update({ id }, { status });
    return this.repo.findOne({ where: { id } });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.repo.delete({ id });
    return { ok: true };
  }
}
