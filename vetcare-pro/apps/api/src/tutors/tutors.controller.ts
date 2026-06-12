import {
  Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { Tutor } from '../common/entities';
import { JwtAuthGuard } from '../auth/jwt.guard';

class TutorDto {
  @IsString() @MinLength(2) name: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() document?: string;
  @IsOptional() @IsString() address?: string;
}
class TutorUpdateDto {
  @IsOptional() @IsString() @MinLength(2) name?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() document?: string;
  @IsOptional() @IsString() address?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('tutors')
export class TutorsController {
  constructor(@InjectRepository(Tutor) private repo: Repository<Tutor>) {}

  @Get()
  list(@Query('q') q?: string) {
    return this.repo.find({
      where: q ? [{ name: ILike(`%${q}%`) }, { phone: ILike(`%${q}%`) }] : undefined,
      order: { name: 'ASC' },
      take: 200,
    });
  }

  @Get(':id')
  async one(@Param('id') id: string) {
    const t = await this.repo.findOne({ where: { id }, relations: { patients: true } });
    if (!t) throw new NotFoundException('Tutor não encontrado');
    return t;
  }

  @Post()
  create(@Body() dto: TutorDto) { return this.repo.save(this.repo.create(dto)); }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: TutorUpdateDto) {
    await this.repo.update({ id }, dto);
    return this.repo.findOne({ where: { id } });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.repo.delete({ id });
    return { ok: true };
  }
}
