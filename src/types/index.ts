export type AnswerType =
  | 'sim_nao'          // Botões Sim / Não
  | 'numero'           // Número com + e -
  | 'texto'            // Texto curto
  | 'texto_longo'      // Texto longo (multiline)
  | 'horario'          // Horário único (ex: 12:00)
  | 'horario_intervalo' // Intervalo de horário (ex: 14:00 até 17:00)
  | 'selecao_alimentos'; // Seleção múltipla de opções

export const ANSWER_TYPE_LABELS: Record<AnswerType, string> = {
  sim_nao: 'Sim / Não',
  numero: 'Número',
  texto: 'Texto curto',
  texto_longo: 'Texto longo',
  horario: 'Horário',
  horario_intervalo: 'Intervalo de horário',
  selecao_alimentos: 'Seleção de opções',
};

export interface Question {
  id: string;
  label: string;
  answerType: AnswerType;
  defaultAnswer?: string;
  order: number;
  optionsListId?: string; // ID da lista de opções (para selecao_alimentos)
}

export interface OpcoesList {
  id: string;
  name: string;
  items: string[];
}

export interface Settings {
  caregiverName: string;
}
