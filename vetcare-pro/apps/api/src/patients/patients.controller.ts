import {
  Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { Patient, Tutor } from '../common/entities';
import { JwtAuthGuard } from '../auth/jwt.guard';

class PatientDto {
  @IsString() @MinLength(1) name: string;
  @IsString() species: string;
  @IsOptional() @IsString() breed?: string;
  @IsOptional() @IsString() sex?: string;
  @IsOptional() @IsString() birthDate?: string;
  @IsOptional() @IsNumber() weightKg?: number;
  @IsOptional() @IsString() microchip?: string;
  @IsOptional() @IsString() coat?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsUUID() tutorId?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientsController {
  constructor(
    @InjectRepository(Patient) private repo: Repository<Patient>,
    @InjectRepository(Tutor) private tutors: Repository<Tutor>,
  ) {}

  @Get()
  list(@Query('q') q?: string) {
    return this.repo.find({
      where: q
        ? [{ name: ILike(`%${q}%`) }, { microchip: ILike(`%${q}%`) }, { species: ILike(`%${q}%`) }]
        : undefined,
      order: { name: 'ASC' },
      take: 300,
    });
  }

  // Busca por microchip (RFID / ISO) — base para o futuro app de rastreabilidade
  @Get('microchip/:code')
  async byChip(@Param('code') code: string) {
    const p = await this.repo.findOne({ where: { microchip: code } });
    if (!p) throw new NotFoundException('Nenhum animal com este microchip');
    return p;
  }

  @Get(':id')
  async one(@Param('id') id: string) {
    const p = await this.repo.findOne({ where: { id }, relations: { records: true } });
    if (!p) throw new NotFoundException('Paciente não encontrado');
    p.records?.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return p;
  }

  @Post()
  async create(@Body() dto: PatientDto) {
    const { tutorId, ...data } = dto;
    const patient = this.repo.create(data);
    if (tutorId) patient.tutor = await this.tutors.findOne({ where: { id: tutorId } });
    return this.repo.save(patient);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<PatientDto>) {
    const patient = await this.repo.findOne({ where: { id } });
    if (!patient) throw new NotFoundException('Paciente não encontrado');
    const { tutorId, ...data } = dto;
    Object.assign(patient, data);
    if (tutorId) patient.tutor = await this.tutors.findOne({ where: { id: tutorId } });
    return this.repo.save(patient);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.repo.delete({ id });
    return { ok: true };
  }
}
