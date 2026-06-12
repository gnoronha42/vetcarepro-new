// Base de conhecimento clínico veterinário (simplificada, para apoio à decisão).
// IMPORTANTE: ferramenta de APOIO. Não substitui avaliação do médico-veterinário.
export interface ClinicalRule {
  condition: string;
  species: ('canino' | 'felino' | 'qualquer')[];
  signs: string[];        // sinais que pontuam
  redFlags?: string[];    // sinais de gravidade
  recommendation: string;
  exams: string[];
}

export const KNOWLEDGE_BASE: ClinicalRule[] = [
  {
    condition: 'Gastroenterite / distúrbio gastrointestinal',
    species: ['qualquer'],
    signs: ['vomito', 'diarreia', 'anorexia', 'apatia', 'desidratacao', 'dor abdominal'],
    redFlags: ['vomito com sangue', 'diarreia com sangue', 'desidratacao'],
    recommendation: 'Hidratação, dieta leve/branda e suporte sintomático. Avaliar antieméticos e protetores gástricos.',
    exams: ['Hemograma', 'Bioquímico (ALT, FA, ureia, creatinina)', 'Parasitológico de fezes'],
  },
  {
    condition: 'Parvovirose (suspeita)',
    species: ['canino'],
    signs: ['vomito', 'diarreia com sangue', 'apatia', 'anorexia', 'febre', 'filhote'],
    redFlags: ['diarreia com sangue', 'desidratacao', 'prostracao'],
    recommendation: 'EMERGÊNCIA em filhotes não vacinados. Internação, fluidoterapia e isolamento. Confirmar com teste rápido.',
    exams: ['Teste rápido de antígeno (parvo)', 'Hemograma', 'Eletrólitos'],
  },
  {
    condition: 'Doença renal / Insuficiência renal',
    species: ['qualquer'],
    signs: ['poliuria', 'polidipsia', 'anorexia', 'perda de peso', 'vomito', 'halitose', 'apatia'],
    redFlags: ['anuria', 'prostracao'],
    recommendation: 'Avaliar função renal e hidratação. Dieta renal e fluidoterapia conforme estadiamento.',
    exams: ['Bioquímico (ureia, creatinina, SDMA)', 'Urinálise', 'Pressão arterial'],
  },
  {
    condition: 'Diabetes mellitus',
    species: ['qualquer'],
    signs: ['poliuria', 'polidipsia', 'polifagia', 'perda de peso', 'apatia'],
    recommendation: 'Confirmar glicemia e frutosamina. Manejo dietético e insulinoterapia conforme protocolo.',
    exams: ['Glicemia', 'Frutosamina', 'Urinálise (glicosúria)'],
  },
  {
    condition: 'Dermatite alérgica / atopia',
    species: ['qualquer'],
    signs: ['prurido', 'alopecia', 'eritema', 'lambedura excessiva', 'otite'],
    recommendation: 'Investigar pulgas e alergias alimentares. Controle antiparasitário e manejo do prurido.',
    exams: ['Raspado cutâneo', 'Citologia de pele', 'Teste de dieta de eliminação'],
  },
  {
    condition: 'Otite externa',
    species: ['qualquer'],
    signs: ['otite', 'prurido', 'odor', 'balancar a cabeca', 'dor de ouvido'],
    recommendation: 'Limpeza e citologia auricular para definir agente (bactéria/Malassezia). Tratamento tópico direcionado.',
    exams: ['Citologia de cerúmen', 'Otoscopia'],
  },
  {
    condition: 'Cardiopatia / Insuficiência cardíaca',
    species: ['qualquer'],
    signs: ['tosse', 'cansaco', 'intolerancia ao exercicio', 'dispneia', 'desmaio', 'cianose'],
    redFlags: ['dispneia', 'cianose', 'desmaio'],
    recommendation: 'Avaliação cardiológica. Em dispneia, estabilizar (O₂) antes de exames estressantes.',
    exams: ['Radiografia torácica', 'Ecocardiograma', 'Eletrocardiograma'],
  },
  {
    condition: 'Doença do trato urinário inferior felino (FLUTD)',
    species: ['felino'],
    signs: ['disuria', 'hematuria', 'periuria', 'lambedura genital', 'estrangia', 'obstrucao urinaria'],
    redFlags: ['obstrucao urinaria', 'anuria'],
    recommendation: 'Macho com obstrução é EMERGÊNCIA. Avaliar bexiga, desobstruir e manejar estresse/dieta.',
    exams: ['Urinálise', 'Ultrassom abdominal', 'Bioquímico (potássio, ureia)'],
  },
  {
    condition: 'Erliquiose / hemoparasitose',
    species: ['canino'],
    signs: ['febre', 'apatia', 'anorexia', 'sangramento', 'petequias', 'carrapato', 'perda de peso'],
    redFlags: ['sangramento', 'petequias'],
    recommendation: 'Suspeita em região endêmica com histórico de carrapato. Confirmar e tratar precocemente.',
    exams: ['Hemograma (plaquetas)', 'Esfregaço sanguíneo', 'Teste sorológico/PCR'],
  },
  {
    condition: 'Afecção musculoesquelética / dor ortopédica',
    species: ['qualquer'],
    signs: ['claudicacao', 'dor', 'dificuldade para levantar', 'relutancia ao movimento', 'edema articular'],
    recommendation: 'Exame ortopédico e manejo de dor. Restrição de exercício e imagem conforme necessidade.',
    exams: ['Radiografia da região', 'Exame ortopédico', 'Avaliação neurológica'],
  },
];

export const SYMPTOM_SYNONYMS: Record<string, string> = {
  'vômito': 'vomito', 'vomitando': 'vomito', 'vomitos': 'vomito',
  'diarréia': 'diarreia', 'diarreias': 'diarreia',
  'não come': 'anorexia', 'nao come': 'anorexia', 'sem apetite': 'anorexia', 'inapetencia': 'anorexia',
  'bebe muita agua': 'polidipsia', 'sede excessiva': 'polidipsia',
  'urina muito': 'poliuria', 'muito xixi': 'poliuria',
  'coceira': 'prurido', 'cocando': 'prurido', 'se coca': 'prurido',
  'manca': 'claudicacao', 'mancando': 'claudicacao',
  'falta de ar': 'dispneia', 'cansado': 'cansaco', 'prostrado': 'prostracao',
  'ouvido': 'otite', 'sangue na urina': 'hematuria',
};
