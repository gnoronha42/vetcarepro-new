import { Injectable } from '@nestjs/common';
import { KNOWLEDGE_BASE, SYMPTOM_SYNONYMS, ClinicalRule } from './knowledge-base';

export interface DiagnosisInput {
  species?: string;
  symptoms: string;      // texto livre ou lista separada por vírgula
  age?: string;
  notes?: string;
}

export interface DiagnosisResult {
  condition: string;
  confidence: number;    // 0–100
  matchedSigns: string[];
  hasRedFlags: boolean;
  recommendation: string;
  suggestedExams: string[];
}

@Injectable()
export class AiService {
  private normalize(text: string): string[] {
    let t = (text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    for (const [k, v] of Object.entries(SYMPTOM_SYNONYMS)) {
      const kn = k.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (t.includes(kn)) t += ' ' + v;
    }
    return t.split(/[,;.\n]+/).map((s) => s.trim()).filter(Boolean).concat(t.split(/\s+/));
  }

  private speciesKey(s?: string): 'canino' | 'felino' | 'qualquer' {
    const n = (s || '').toLowerCase();
    if (n.includes('can') || n.includes('cao') || n.includes('cão') || n.includes('dog')) return 'canino';
    if (n.includes('fel') || n.includes('gat') || n.includes('cat')) return 'felino';
    return 'qualquer';
  }

  diagnose(input: DiagnosisInput): { results: DiagnosisResult[]; disclaimer: string } {
    const tokens = this.normalize(`${input.symptoms} ${input.notes || ''}`);
    const sp = this.speciesKey(input.species);

    const scored = KNOWLEDGE_BASE
      .filter((r) => r.species.includes('qualquer') || r.species.includes(sp))
      .map((rule: ClinicalRule) => {
        const matched = rule.signs.filter((sig) =>
          tokens.some((tk) => tk.includes(sig) || sig.includes(tk)),
        );
        const redFlags = (rule.redFlags || []).filter((rf) =>
          tokens.some((tk) => tk.includes(rf.split(' ')[0])),
        );
        const base = (matched.length / rule.signs.length) * 100;
        // Bônus por espécie específica e por sinais de gravidade reconhecidos
        const speciesBonus = rule.species.includes(sp) && sp !== 'qualquer' ? 12 : 0;
        const confidence = Math.min(98, Math.round(base + speciesBonus + redFlags.length * 4));
        return {
          condition: rule.condition,
          confidence,
          matchedSigns: matched,
          hasRedFlags: redFlags.length > 0,
          recommendation: rule.recommendation,
          suggestedExams: rule.exams,
        } as DiagnosisResult;
      })
      .filter((r) => r.matchedSigns.length > 0)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 4);

    return {
      results: scored,
      disclaimer:
        'Sugestão gerada por sistema de apoio à decisão. NÃO substitui o exame clínico e o julgamento do médico-veterinário responsável.',
    };
  }
}
