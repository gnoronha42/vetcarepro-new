import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'path';
import * as bcrypt from 'bcryptjs';
import {
  User, Tutor, Patient, MedicalRecord, Appointment, Notification, Invoice, InventoryItem,
} from './common/entities';

const entities = [User, Tutor, Patient, MedicalRecord, Appointment, Notification, Invoice, InventoryItem];

async function run() {
  const ds = new DataSource(
    process.env.DATABASE_URL
      ? { type: 'postgres', url: process.env.DATABASE_URL, entities, synchronize: true }
      : { type: 'better-sqlite3', database: join(process.cwd(), 'vetcare.sqlite'), entities, synchronize: true } as any,
  );
  await ds.initialize();

  const users = ds.getRepository(User);
  if (!(await users.findOne({ where: { email: 'admin@vetcare.pro' } }))) {
    await users.save(users.create({
      name: 'Dra. Helena Costa', email: 'admin@vetcare.pro',
      passwordHash: await bcrypt.hash('admin123', 10), role: 'admin', crmv: 'CRMV-SP 12345',
    }));
    console.log('👤 Usuário admin criado: admin@vetcare.pro / admin123');
  }

  const tutorRepo = ds.getRepository(Tutor);
  if ((await tutorRepo.count()) === 0) {
    const t1 = await tutorRepo.save(tutorRepo.create({ name: 'Mariana Alves', phone: '(92) 98888-1010', email: 'mariana@email.com', document: '123.456.789-00', address: 'Av. Eduardo Ribeiro, 500 - Manaus/AM' }));
    const t2 = await tutorRepo.save(tutorRepo.create({ name: 'Carlos Pereira', phone: '(92) 99777-2020', email: 'carlos@email.com', address: 'Rua dos Andradas, 120 - Manaus/AM' }));
    const t3 = await tutorRepo.save(tutorRepo.create({ name: 'Júlia Fernandes', phone: '(92) 99666-3030', email: 'julia@email.com' }));

    const patientRepo = ds.getRepository(Patient);
    const p1 = await patientRepo.save(patientRepo.create({ name: 'Thor', species: 'Canino', breed: 'Labrador', sex: 'Macho', birthDate: '2020-03-15', weightKg: 32.5, coat: 'Caramelo', microchip: '982000123456789', tutor: t1 }));
    const p2 = await patientRepo.save(patientRepo.create({ name: 'Luna', species: 'Felino', breed: 'SRD', sex: 'Fêmea', birthDate: '2021-07-10', weightKg: 4.2, coat: 'Tricolor', microchip: '982000987654321', tutor: t2 }));
    const p3 = await patientRepo.save(patientRepo.create({ name: 'Bidu', species: 'Canino', breed: 'Poodle', sex: 'Macho', birthDate: '2018-11-01', weightKg: 8.1, tutor: t1 }));
    const p4 = await patientRepo.save(patientRepo.create({ name: 'Mel', species: 'Felino', breed: 'Persa', sex: 'Fêmea', birthDate: '2022-01-20', weightKg: 3.8, tutor: t3 }));

    const recRepo = ds.getRepository(MedicalRecord);
    await recRepo.save(recRepo.create({ patient: p1, vetName: 'Dra. Helena Costa', type: 'consulta', anamnesis: 'Tutor relata vômito e apatia há 2 dias.', symptoms: 'vomito, apatia, anorexia', physicalExam: 'Mucosas normocoradas, leve desidratação 5%.', diagnosis: 'Gastroenterite leve', treatment: 'Hidratação, dieta branda, antiemético.', weightKg: 32.5, temperatureC: 38.9 }));
    await recRepo.save(recRepo.create({ patient: p2, vetName: 'Dra. Helena Costa', type: 'vacina', diagnosis: 'Hígida', treatment: 'V4 felina aplicada.', weightKg: 4.2, temperatureC: 38.5 }));

    const apptRepo = ds.getRepository(Appointment);
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(9, 0, 0, 0);
    const later = new Date(); later.setDate(later.getDate() + 1); later.setHours(10, 30, 0, 0);
    const today = new Date(); today.setHours(15, 0, 0, 0);
    await apptRepo.save(apptRepo.create({ patient: p1, startsAt: tomorrow.toISOString(), type: 'retorno', vetName: 'Dra. Helena Costa', status: 'confirmado' }));
    await apptRepo.save(apptRepo.create({ patient: p3, startsAt: later.toISOString(), type: 'consulta', status: 'agendado' }));
    await apptRepo.save(apptRepo.create({ patient: p4, startsAt: today.toISOString(), type: 'vacina', status: 'confirmado' }));

    const notifRepo = ds.getRepository(Notification);
    await notifRepo.save(notifRepo.create({ tutor: t1, kind: 'retorno', title: 'Retorno do Thor', message: 'Thor tem retorno amanhã às 09h. Confirme sua presença.', channel: 'app', status: 'enviada' }));
    await notifRepo.save(notifRepo.create({ tutor: t2, kind: 'vacina', title: 'Vacina da Luna', message: 'A próxima dose da Luna vence em 7 dias.', channel: 'whatsapp', status: 'pendente' }));

    const invRepo = ds.getRepository(Invoice);
    const paid = invRepo.create({ tutor: t1, description: 'Consulta + medicação — Thor', amount: 180, status: 'paga', method: 'pix', paidAt: new Date().toISOString() });
    await invRepo.save(paid);
    await invRepo.save(invRepo.create({ tutor: t2, description: 'Vacina V4 — Luna', amount: 90, status: 'paga', method: 'cartao', paidAt: new Date().toISOString() }));
    await invRepo.save(invRepo.create({ tutor: t3, description: 'Consulta — Mel', amount: 150, status: 'aberta' }));

    const itemRepo = ds.getRepository(InventoryItem);
    await itemRepo.save([
      itemRepo.create({ name: 'Vacina V10', category: 'vacina', quantity: 24, minQuantity: 10, unitPrice: 45 }),
      itemRepo.create({ name: 'Vacina Antirrábica', category: 'vacina', quantity: 8, minQuantity: 10, unitPrice: 30 }),
      itemRepo.create({ name: 'Amoxicilina 500mg', category: 'medicamento', quantity: 60, minQuantity: 20, unitPrice: 2.5 }),
      itemRepo.create({ name: 'Seringa 5ml', category: 'insumo', quantity: 4, minQuantity: 50, unitPrice: 0.8 }),
      itemRepo.create({ name: 'Microchip ISO 11784', category: 'insumo', quantity: 30, minQuantity: 15, unitPrice: 18 }),
    ]);

    console.log('🌱 Dados de demonstração inseridos com sucesso.');
  } else {
    console.log('ℹ️  Banco já possui dados. Seed ignorado.');
  }

  await ds.destroy();
}
run().catch((e) => { console.error(e); process.exit(1); });
