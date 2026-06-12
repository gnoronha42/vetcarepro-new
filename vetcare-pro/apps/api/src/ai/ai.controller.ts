import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

class DiagnoseDto {
  @IsOptional() @IsString() species?: string;
  @IsString() @MinLength(2) symptoms: string;
  @IsOptional() @IsString() age?: string;
  @IsOptional() @IsString() notes?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private ai: AiService) {}

  @Post('diagnose')
  diagnose(@Body() dto: DiagnoseDto) {
    return this.ai.diagnose(dto);
  }
}
