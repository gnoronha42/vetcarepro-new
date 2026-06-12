import {
  Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { MedicalRecord, Patient } from '../common/entities';
import { JwtAuthGuard } from '../auth/jwt.guard';

class RecordDto {
  @IsUUID() patientId: string;
  @IsOptional() @IsString() vetName?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() anamnesis?: string;
  @IsOptional() @IsString() symptoms?: string;
  @IsOptional() @IsString() physicalExam?: string;
  @IsOptional() @IsString() diagnosis?: string;
  @IsOptional() @IsString() aiSuggestion?: string;
  @IsOptional() @IsString() treatment?: string;
  @IsOptional() @IsNumber() weightKg?: number;
  @IsOptional() @IsNumber() temperatureC?: number;
  @IsOptional() @IsString() followUpDate?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('records')
export class RecordsController {
  constructor(
    @InjectRepository(MedicalRecord) private repo: Repository<MedicalRecord>,
    @InjectRepository(Patient) private patients: Repository<Patient>,
  ) {}

  @Get()
  list(@Query('patientId') patientId?: string) {
    return this.repo.find({
      where: patientId ? { patient: { id: patientId } } : undefined,
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }

  @Post()
  async create(@Body() dto: RecordDto) {
    const patient = await this.patients.findOne({ where: { id: dto.patientId } });
    if (!patient) throw new NotFoundException('Paciente não encontrado');
    const { patientId, ...data } = dto;
    const rec = this.repo.create({ ...data, patient });
    // Atualiza o peso do paciente automaticamente
    if (dto.weightKg) await this.patients.update({ id: patient.id }, { weightKg: dto.weightKg });
    return this.repo.save(rec);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<RecordDto>) {
    const { patientId, ...data } = dto;
    await this.repo.update({ id }, data);
    return this.repo.findOne({ where: { id } });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.repo.delete({ id });
    return { ok: true };
  }
}
