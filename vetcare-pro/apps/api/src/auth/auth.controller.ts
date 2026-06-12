import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { JwtAuthGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  // Limite mais rígido contra força bruta
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('login')
  login(@Body() dto: LoginDto) { return this.auth.login(dto); }

  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('register')
  register(@Body() dto: RegisterDto) { return this.auth.register(dto); }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) { return req.user; }
}
