import { Body, Controller, Post } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';

class ChatDto { @IsString() @MinLength(1) message: string; }

interface Faq { keys: string[]; answer: string; }

// Chatbot de dúvidas frequentes (sem dependência externa).
const FAQS: Faq[] = [
  { keys: ['horario', 'funcionamento', 'aberto', 'atende'],
    answer: 'Nosso horário de atendimento é de segunda a sexta, das 8h às 18h, e aos sábados das 8h às 12h.' },
  { keys: ['agendar', 'marcar', 'consulta', 'agendamento'],
    answer: 'Para agendar uma consulta, acesse o menu "Agenda" e escolha um horário livre, ou ligue para a recepção. O sistema sugere automaticamente os horários disponíveis.' },
  { keys: ['vacina', 'vacinacao', 'v8', 'v10', 'antirrabica', 'raiva'],
    answer: 'Mantemos o calendário vacinal completo (V8/V10, antirrábica, gripe felina). O tutor recebe lembretes automáticos quando a próxima dose se aproxima.' },
  { keys: ['microchip', 'chip', 'rfid', 'identificacao'],
    answer: 'Realizamos implante de microchip RFID (padrão ISO) para identificação e rastreabilidade do animal. O número fica vinculado ao prontuário e ao tutor.' },
  { keys: ['preco', 'valor', 'custa', 'pagamento', 'pix', 'cartao'],
    answer: 'Os valores variam conforme o procedimento. Aceitamos Pix, cartão e dinheiro. A recepção pode enviar um orçamento detalhado.' },
  { keys: ['emergencia', 'urgencia', 'plantao'],
    answer: 'Em caso de emergência (dificuldade para respirar, sangramento, intoxicação, trauma), traga o animal imediatamente. Sinais de gravidade exigem atendimento sem agendamento.' },
  { keys: ['castracao', 'castrar', 'cirurgia'],
    answer: 'Realizamos castração e cirurgias com avaliação pré-operatória. É necessário jejum prévio — a equipe orienta cada caso no agendamento.' },
  { keys: ['exame', 'sangue', 'ultrassom', 'raio x', 'raio-x'],
    answer: 'Oferecemos exames laboratoriais e de imagem (hemograma, bioquímico, ultrassom, radiografia). Os resultados ficam registrados no prontuário digital.' },
];

@Controller('chatbot')
export class ChatbotController {
  @Post()
  reply(@Body() dto: ChatDto) {
    const msg = dto.message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let best: Faq | null = null; let score = 0;
    for (const f of FAQS) {
      const s = f.keys.filter((k) => msg.includes(k)).length;
      if (s > score) { score = s; best = f; }
    }
    if (best && score > 0) return { answer: best.answer, matched: true };
    return {
      matched: false,
      answer:
        'Posso ajudar com: horários, agendamento, vacinas, microchip, exames, castração, valores e emergências. ' +
        'Sobre o que você gostaria de saber? Para casos clínicos, fale com nossa equipe veterinária.',
    };
  }
}
