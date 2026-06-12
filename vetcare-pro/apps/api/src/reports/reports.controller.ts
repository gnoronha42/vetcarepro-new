import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Appointment, InventoryItem, Invoice, MedicalRecord, Patient, Tutor,
} from '../common/entities';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    @InjectRepository(Patient) private patients: Repository<Patient>,
    @InjectRepository(Tutor) private tutors: Repository<Tutor>,
    @InjectRepository(Appointment) private appts: Repository<Appointment>,
    @InjectRepository(Invoice) private invoices: Repository<Invoice>,
    @InjectRepository(InventoryItem) private items: Repository<InventoryItem>,
    @InjectRepository(MedicalRecord) private records: Repository<MedicalRecord>,
  ) {}

  @Get('dashboard')
  async dashboard() {
    const [patients, tutors, appts, invoices, items, records] = await Promise.all([
      this.patients.find(), this.tutors.find(), this.appts.find(),
      this.invoices.find(), this.items.find(), this.records.find(),
    ]);

    const today = new Date().toISOString().slice(0, 10);
    const apptsToday = appts.filter((a) => a.startsAt.startsWith(today) && a.status !== 'cancelado');
    const revenuePaid = invoices.filter((i) => i.status === 'paga').reduce((a, i) => a + i.amount, 0);
    const revenueOpen = invoices.filter((i) => i.status === 'aberta').reduce((a, i) => a + i.amount, 0);

    // Espécies
    const speciesMap: Record<string, number> = {};
    patients.forEach((p) => { speciesMap[p.species] = (speciesMap[p.species] || 0) + 1; });

    // Faturamento últimos 6 meses
    const months: { label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('pt-BR', { month: 'short' });
      const value = invoices
        .filter((inv) => inv.status === 'paga' && (inv.paidAt || '').slice(0, 7) === key)
        .reduce((a, inv) => a + inv.amount, 0);
      months.push({ label, value });
    }

    // Tipos de atendimento
    const apptTypes: Record<string, number> = {};
    appts.forEach((a) => { apptTypes[a.type] = (apptTypes[a.type] || 0) + 1; });

    return {
      counters: {
        patients: patients.length,
        tutors: tutors.length,
        appointmentsToday: apptsToday.length,
        appointmentsTotal: appts.length,
        records: records.length,
        revenuePaid,
        revenueOpen,
        lowStock: items.filter((i) => i.quantity <= i.minQuantity).length,
      },
      speciesDistribution: Object.entries(speciesMap).map(([name, value]) => ({ name, value })),
      revenueByMonth: months,
      appointmentsByType: Object.entries(apptTypes).map(([name, value]) => ({ name, value })),
      upcoming: appts
        .filter((a) => +new Date(a.startsAt) >= Date.now() && a.status !== 'cancelado')
        .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))
        .slice(0, 8),
    };
  }
}
