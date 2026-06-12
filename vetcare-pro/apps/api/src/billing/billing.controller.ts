import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsNumber, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';
import { Invoice, Tutor } from '../common/entities';
import { JwtAuthGuard } from '../auth/jwt.guard';

class InvoiceDto {
  @IsOptional() @IsUUID() tutorId?: string;
  @IsString() @MinLength(2) description: string;
  @IsNumber() @Min(0) amount: number;
  @IsOptional() @IsString() method?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(
    @InjectRepository(Invoice) private repo: Repository<Invoice>,
    @InjectRepository(Tutor) private tutors: Repository<Tutor>,
  ) {}

  @Get()
  list() { return this.repo.find({ order: { createdAt: 'DESC' }, take: 200 }); }

  @Get('summary')
  async summary() {
    const all = await this.repo.find();
    const sum = (s: string) => all.filter((i) => i.status === s).reduce((a, i) => a + i.amount, 0);
    return {
      total: all.reduce((a, i) => a + i.amount, 0),
      paid: sum('paga'),
      open: sum('aberta'),
      count: all.length,
    };
  }

  @Post()
  async create(@Body() dto: InvoiceDto) {
    const inv = this.repo.create({ description: dto.description, amount: dto.amount, method: dto.method });
    if (dto.tutorId) inv.tutor = await this.tutors.findOne({ where: { id: dto.tutorId } });
    return this.repo.save(inv);
  }

  @Patch(':id/pay')
  async pay(@Param('id') id: string, @Body('method') method?: string) {
    await this.repo.update({ id }, { status: 'paga', method: method || 'pix', paidAt: new Date().toISOString() });
    return this.repo.findOne({ where: { id } });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.repo.delete({ id });
    return { ok: true };
  }
}
