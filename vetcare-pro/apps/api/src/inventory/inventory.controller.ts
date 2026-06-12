import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { InventoryItem } from '../common/entities';
import { JwtAuthGuard } from '../auth/jwt.guard';

class ItemDto {
  @IsString() @MinLength(2) name: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsInt() @Min(0) quantity?: number;
  @IsOptional() @IsInt() @Min(0) minQuantity?: number;
  @IsOptional() @IsNumber() @Min(0) unitPrice?: number;
  @IsOptional() @IsString() expiresAt?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(@InjectRepository(InventoryItem) private repo: Repository<InventoryItem>) {}

  @Get()
  list() { return this.repo.find({ order: { name: 'ASC' }, take: 300 }); }

  // Itens em estoque baixo (para alertas)
  @Get('low-stock')
  async lowStock() {
    const all = await this.repo.find();
    return all.filter((i) => i.quantity <= i.minQuantity);
  }

  @Post()
  create(@Body() dto: ItemDto) { return this.repo.save(this.repo.create(dto)); }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<ItemDto>) {
    await this.repo.update({ id }, dto);
    return this.repo.findOne({ where: { id } });
  }

  // Movimentação de estoque (entrada/saída)
  @Patch(':id/move')
  async move(@Param('id') id: string, @Body('delta') delta: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) return { ok: false };
    item.quantity = Math.max(0, item.quantity + Number(delta || 0));
    return this.repo.save(item);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.repo.delete({ id });
    return { ok: true };
  }
}
