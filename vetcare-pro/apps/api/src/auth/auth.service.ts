import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../common/entities';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.users.findOne({ where: { email: dto.email.toLowerCase() } });
    if (exists) throw new ConflictException('E-mail já cadastrado');
    // Primeiro usuário do sistema vira admin automaticamente
    const count = await this.users.count();
    const user = this.users.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash: await bcrypt.hash(dto.password, 10),
      role: count === 0 ? 'admin' : dto.role || 'vet',
      crmv: dto.crmv,
    });
    await this.users.save(user);
    return this.sign(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.email = :email', { email: dto.email.toLowerCase() })
      .getOne();
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash)))
      throw new UnauthorizedException('Credenciais inválidas');
    return this.sign(user);
  }

  private sign(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
    return {
      accessToken: this.jwt.sign(payload),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }
}
