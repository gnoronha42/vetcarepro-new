import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';

export type Role = 'admin' | 'vet' | 'recepcao';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ unique: true }) email: string;
  @Column({ select: false }) passwordHash: string;
  @Column({ default: 'vet' }) role: Role;
  @Column({ nullable: true }) crmv: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('tutors')
export class Tutor {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ nullable: true }) email: string;
  @Column({ nullable: true }) phone: string;
  @Column({ nullable: true }) document: string; // CPF
  @Column({ nullable: true }) address: string;
  @OneToMany(() => Patient, (p) => p.tutor) patients: Patient[];
  @CreateDateColumn() createdAt: Date;
}

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column() species: string; // canino, felino, ave, ...
  @Column({ nullable: true }) breed: string;
  @Column({ nullable: true }) sex: string;
  @Column({ nullable: true }) birthDate: string;
  @Column('float', { nullable: true }) weightKg: number;
  @Column({ nullable: true, unique: true }) microchip: string; // RFID/ISO 11784-11785
  @Column({ nullable: true }) coat: string;
  @Column({ default: true }) active: boolean;
  @Column({ nullable: true }) notes: string;
  @ManyToOne(() => Tutor, (t) => t.patients, { eager: true, onDelete: 'SET NULL' })
  @JoinColumn() tutor: Tutor;
  @OneToMany(() => MedicalRecord, (r) => r.patient) records: MedicalRecord[];
  @CreateDateColumn() createdAt: Date;
}

@Entity('medical_records')
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Patient, (p) => p.records, { eager: true, onDelete: 'CASCADE' })
  patient: Patient;
  @Column({ nullable: true }) vetName: string;
  @Column({ default: 'consulta' }) type: string; // consulta, vacina, exame, cirurgia, retorno
  @Column({ nullable: true }) anamnesis: string;       // queixa / histórico
  @Column({ nullable: true }) symptoms: string;        // sinais clínicos (separados por vírgula)
  @Column({ nullable: true }) physicalExam: string;    // exame físico
  @Column({ nullable: true }) diagnosis: string;
  @Column({ nullable: true }) aiSuggestion: string;    // sugestão registrada da IA
  @Column({ nullable: true }) treatment: string;       // conduta / prescrição
  @Column('float', { nullable: true }) weightKg: number;
  @Column('float', { nullable: true }) temperatureC: number;
  @Column({ nullable: true }) followUpDate: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Patient, { eager: true, onDelete: 'CASCADE' }) patient: Patient;
  @Column() startsAt: string; // ISO
  @Column({ default: 30 }) durationMin: number;
  @Column({ default: 'consulta' }) type: string; // consulta, vacina, banho, cirurgia, retorno, exame
  @Column({ default: 'agendado' }) status: string; // agendado, confirmado, atendido, cancelado, faltou
  @Column({ nullable: true }) vetName: string;
  @Column({ nullable: true }) notes: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Tutor, { eager: true, nullable: true, onDelete: 'CASCADE' }) tutor: Tutor;
  @Column() title: string;
  @Column() message: string;
  @Column({ default: 'geral' }) kind: string; // lembrete, vacina, retorno, financeiro, geral
  @Column({ default: 'pendente' }) status: string; // pendente, enviada, lida
  @Column({ nullable: true }) channel: string; // app, email, whatsapp
  @CreateDateColumn() createdAt: Date;
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Tutor, { eager: true, nullable: true, onDelete: 'SET NULL' }) tutor: Tutor;
  @Column() description: string;
  @Column('float') amount: number;
  @Column({ default: 'aberta' }) status: string; // aberta, paga, cancelada
  @Column({ nullable: true }) method: string; // pix, cartao, dinheiro
  @Column({ nullable: true }) paidAt: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ default: 'medicamento' }) category: string; // medicamento, vacina, insumo, racao
  @Column('int', { default: 0 }) quantity: number;
  @Column('int', { default: 5 }) minQuantity: number;
  @Column('float', { default: 0 }) unitPrice: number;
  @Column({ nullable: true }) expiresAt: string;
  @UpdateDateColumn() updatedAt: Date;
}
