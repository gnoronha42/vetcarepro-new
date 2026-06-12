import {
  BadRequestException, Body, Controller, Delete, Get, NotFoundException,
  Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsInt, IsISO8601, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Appointment, Notification, Patient } from '../common/entities';
import { JwtAuthGuard } from '../auth/jwt.guard';

class AppointmentDto {
  @IsUUID() patientId: string;
  @IsISO8601() startsAt: string;
  @IsOptional() @IsInt() @Min(10) @Max(480) durationMin?: number;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() vetName?: string;
  @IsOptional() @IsString() notes?: string;
}

const overlaps = (aStart: number, aMin: number, bStart: number, bMin: number) =>
  aStart < bStart + bMin * 60_000 && bStart < aStart + aMin * 60_000;

@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(
    @InjectRepository(Appointment) private repo: Repository<Appointment>,
    @InjectRepository(Patient) private patients: Repository<Patient>,
    @InjectRepository(Notification) private notifications: Repository<Notification>,
  ) {}

  @Get()
  async list(@Query('from') from?: string, @Query('to') to?: string) {
    const all = await this.repo.find({ order: { startsAt: 'ASC' }, take: 500 });
    return all.filter((a) => {
      const t = +new Date(a.startsAt);
      if (from && t < +new Date(from)) return false;
      if (to && t > +new Date(to)) return false;
      return true;
    });
  }

  // Sugestão inteligente de horários livres para um dia (08h–18h)
  @Get('slots')
  async slots(@Query('date') date: string, @Query('duration') duration = '30') {
    if (!date) throw new BadRequestException('Informe ?date=AAAA-MM-DD');
    const dur = Math.max(10, parseInt(duration, 10) || 30);
    const busy = (await this.repo.find())
      .filter((a) => a.status !== 'cancelado' && a.startsAt.startsWith(date))
      .map((a) => ({ start: +new Date(a.startsAt), min: a.durationMin }));
    const free: string[] = [];
    for (let h = 8; h < 18; h++) {
      for (const m of [0, 30]) {
        const slot = +new Date(`${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
        if (slot < Date.now()) continue;
        if (!busy.some((b) => overlaps(slot, dur, b.start, b.min))) {
          free.push(new Date(slot).toISOString());
        }
      }
    }
    return { date, durationMin: dur, freeSlots: free };
  }

  @Post()
  async create(@Body() dto: AppointmentDto) {
    const patient = await this.patients.findOne({ where: { id: dto.patientId } });
    if (!patient) throw new NotFoundException('Paciente não encontrado');

    const dur = dto.durationMin || 30;
    const start = +new Date(dto.startsAt);
    const conflict = (await this.repo.find()).find(
      (a) => a.status !== 'cancelado' && overlaps(start, dur, +new Date(a.startsAt), a.durationMin),
    );
    if (conflict)
      throw new BadRequestException(
        `Conflito de horário com ${conflict.patient?.name || 'outro atendimento'} às ${new Date(conflict.startsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      );

    const appt = await this.repo.save(
      this.repo.create({ ...dto, durationMin: dur, patient }),
    );

    // Notificação automática ao tutor
    if (patient.tutor) {
      await this.notifications.save(
        this.notifications.create({
          tutor: patient.tutor,
          kind: 'lembrete',
          title: `Consulta agendada — ${patient.name}`,
          message: `Olá, ${patient.tutor.name}! ${patient.name} tem ${dto.type || 'consulta'} em ${new Date(dto.startsAt).toLocaleString('pt-BR')}.`,
          channel: 'app',
        }),
      );
    }
    return appt;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: Partial<AppointmentDto> & { status?: string }) {
    const appt = await this.repo.findOne({ where: { id } });
    if (!appt) throw new NotFoundException('Agendamento não encontrado');
    const { patientId, ...data } = body;
    Object.assign(appt, data);
    return this.repo.save(appt);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.repo.delete({ id });
    return { ok: true };
  }
}
