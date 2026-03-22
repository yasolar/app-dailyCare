import AsyncStorage from '@react-native-async-storage/async-storage';
import { Question, Settings, OpcoesList } from '../types';

const KEYS = {
  QUESTIONS: '@dailycare:questions',
  SETTINGS: '@dailycare:settings',
  OPCOES_LISTAS: '@dailycare:opcoes_listas',
};

// ── Questions ─────────────────────────────────────────────────────────────────

export async function loadQuestions(): Promise<Question[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.QUESTIONS);
    if (!raw) return getDefaultQuestions();
    const parsed = JSON.parse(raw) as Question[];
    return parsed.sort((a, b) => a.order - b.order);
  } catch {
    return getDefaultQuestions();
  }
}

export async function saveQuestions(questions: Question[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
}

// ── Listas de Opções ──────────────────────────────────────────────────────────

export const DEFAULT_LISTAS: OpcoesList[] = [
  {
    id: 'lista_cafe',
    name: 'Café da Manhã',
    items: ['Pão', 'Ovo', 'Vitamina', 'Suco', 'Iogurte', 'Fruta', 'Mingau', 'Tapioca', 'Cuscuz', 'Queijo', 'Presunto'],
  },
  {
    id: 'lista_almoco',
    name: 'Almoço',
    items: ['Arroz', 'Feijão', 'Macarrão', 'Frango', 'Peixe', 'Bife', 'Carne moída', 'Batata', 'Salada', 'Legumes'],
  },
  {
    id: 'lista_sobremesa',
    name: 'Sobremesa',
    items: ['Fruta', 'Iogurte', 'Gelatina', 'Pudim', 'Vitamina', 'Sorvete'],
  },
  {
    id: 'lista_lanche',
    name: 'Lanche',
    items: ['Pão', 'Suco', 'Vitamina', 'Iogurte', 'Fruta', 'Biscoito', 'Bolo'],
  },
  {
    id: 'lista_jantar',
    name: 'Jantar',
    items: ['Arroz', 'Feijão', 'Macarrão', 'Frango', 'Peixe', 'Bife', 'Carne moída', 'Batata', 'Salada', 'Sopa', 'Legumes'],
  },
];

export async function loadListasOpcoes(): Promise<OpcoesList[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.OPCOES_LISTAS);
    if (!raw) return DEFAULT_LISTAS.map((l) => ({ ...l, items: [...l.items] }));
    return JSON.parse(raw) as OpcoesList[];
  } catch {
    return DEFAULT_LISTAS.map((l) => ({ ...l, items: [...l.items] }));
  }
}

export async function saveListasOpcoes(listas: OpcoesList[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.OPCOES_LISTAS, JSON.stringify(listas));
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (!raw) return { caregiverName: '' };
    return JSON.parse(raw) as Settings;
  } catch {
    return { caregiverName: '' };
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

// ── Default questions ───────────────────────────

function getDefaultQuestions(): Question[] {
  return [
    { id: '1', label: 'Água (quantos copos de 200ml)', answerType: 'numero', defaultAnswer: '0', order: 1 },
    { id: '2', label: 'Remédio (2 gotas)', answerType: 'sim_nao', defaultAnswer: '', order: 2 },
    { id: '3', label: 'Café da Manhã', answerType: 'selecao_alimentos', defaultAnswer: '', order: 3, optionsListId: 'lista_cafe' },
    { id: '4', label: 'Medicação Manhã (20 gotas de memantina e vitamina C)', answerType: 'sim_nao', defaultAnswer: '', order: 4 },
    { id: '5', label: 'Caminhada (horário e quanto tempo caminhou)', answerType: 'texto', defaultAnswer: '', order: 5 },
    { id: '6', label: 'Banho (horário)', answerType: 'horario', defaultAnswer: '', order: 6 },
    { id: '7', label: 'Almoço', answerType: 'selecao_alimentos', defaultAnswer: '', order: 7, optionsListId: 'lista_almoco' },
    { id: '8', label: 'Sobremesa', answerType: 'selecao_alimentos', defaultAnswer: '', order: 8, optionsListId: 'lista_sobremesa' },
    { id: '9', label: 'Sono da tarde (horário)', answerType: 'horario_intervalo', defaultAnswer: '', order: 9 },
    { id: '10', label: 'Lanche', answerType: 'selecao_alimentos', defaultAnswer: '', order: 10, optionsListId: 'lista_lanche' },
    { id: '19', label: 'Jantar', answerType: 'selecao_alimentos', defaultAnswer: '', order: 11, optionsListId: 'lista_jantar' },
    { id: '11', label: 'Medicação da tarde 3 gotas (17h)', answerType: 'sim_nao', defaultAnswer: '', order: 12 },
    { id: '12', label: 'Nutren (preparo e horário)', answerType: 'texto', defaultAnswer: '', order: 13 },
    { id: '13', label: 'Escovação de Dentes e Retirada de Próteses', answerType: 'sim_nao', defaultAnswer: '', order: 14 },
    { id: '14', label: 'Evacuou?', answerType: 'sim_nao', defaultAnswer: '', order: 15 },
    { id: '15', label: 'Urinou?', answerType: 'sim_nao', defaultAnswer: '', order: 16 },
    { id: '16', label: 'Qualidade e Quantidade da urina', answerType: 'texto', defaultAnswer: '', order: 17 },
    { id: '17', label: 'Percebeu dor nas costas?', answerType: 'sim_nao', defaultAnswer: '', order: 18 },
    { id: '18', label: 'Foi ministrado 40 gotas de novalgina (relatar o horário)', answerType: 'sim_nao', defaultAnswer: '', order: 19 },
  ];
}
