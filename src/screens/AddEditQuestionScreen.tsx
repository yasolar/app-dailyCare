import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AnswerType, ANSWER_TYPE_LABELS, Question, OpcoesList } from '../types';
import { loadQuestions, saveQuestions, loadListasOpcoes } from '../storage/storage';
import { QuestionsStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<QuestionsStackParamList, 'AddEditQuestion'>;
type Route = RouteProp<QuestionsStackParamList, 'AddEditQuestion'>;

const COLORS = {
  primary: '#3B82F6',
  border: '#D1D5DB',
  bg: '#F9FAFB',
  text: '#111827',
  muted: '#6B7280',
  white: '#FFFFFF',
  selected: '#EFF6FF',
  selectedBorder: '#3B82F6',
};

const ANSWER_TYPES: AnswerType[] = [
  'sim_nao',
  'numero',
  'texto',
  'texto_longo',
  'horario',
  'horario_intervalo',
  'selecao_alimentos',
];

export default function AddEditQuestionScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const existing = route.params?.question ?? null;

  const [label, setLabel] = useState(existing?.label ?? '');
  const [answerType, setAnswerType] = useState<AnswerType>(existing?.answerType ?? 'sim_nao');
  const [defaultAnswer, setDefaultAnswer] = useState(existing?.defaultAnswer ?? '');
  const [optionsListId, setOptionsListId] = useState<string>(existing?.optionsListId ?? '');
  const [listas, setListas] = useState<OpcoesList[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadListasOpcoes().then(setListas);
  }, []);

  const save = async () => {
    if (!label.trim()) {
      Alert.alert('Atenção', 'Digite o texto da pergunta.');
      return;
    }
    if (answerType === 'selecao_alimentos' && !optionsListId) {
      Alert.alert('Atenção', 'Selecione uma lista de opções para esta pergunta.');
      return;
    }
    setSaving(true);
    const questions = await loadQuestions();

    if (existing) {
      const updated = questions.map((q) =>
        q.id === existing.id
          ? { ...q, label: label.trim(), answerType, defaultAnswer, optionsListId: answerType === 'selecao_alimentos' ? optionsListId : undefined }
          : q
      );
      await saveQuestions(updated);
    } else {
      const newQ: Question = {
        id: Date.now().toString(),
        label: label.trim(),
        answerType,
        defaultAnswer,
        order: questions.length + 1,
        optionsListId: answerType === 'selecao_alimentos' ? optionsListId : undefined,
      };
      await saveQuestions([...questions, newQ]);
    }

    setSaving(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Texto da pergunta</Text>
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
            placeholder="Ex: Água (quantos copos de 200ml)"
            placeholderTextColor={COLORS.muted}
            multiline
          />

          <Text style={styles.sectionTitle}>Tipo de resposta</Text>
          <View style={styles.typesGrid}>
            {ANSWER_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeOption, answerType === t && styles.typeOptionSelected]}
                onPress={() => setAnswerType(t)}
                activeOpacity={0.7}
              >
                <Text style={[styles.typeOptionText, answerType === t && styles.typeOptionTextSelected]}>
                  {ANSWER_TYPE_LABELS[t]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {answerType === 'selecao_alimentos' && (
            <>
              <Text style={styles.sectionTitle}>Lista de opções</Text>
              {listas.length === 0 ? (
                <Text style={styles.hint}>Nenhuma lista criada. Crie listas em "Gerenciar listas de opções".</Text>
              ) : (
                <View style={styles.typesGrid}>
                  {listas.map((lista) => (
                    <TouchableOpacity
                      key={lista.id}
                      style={[styles.typeOption, optionsListId === lista.id && styles.typeOptionSelected]}
                      onPress={() => setOptionsListId(lista.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.typeOptionText, optionsListId === lista.id && styles.typeOptionTextSelected]}>
                        {lista.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}

          <Text style={styles.sectionTitle}>Resposta padrão (opcional)</Text>
          <Text style={styles.hint}>
            Se preenchida, a resposta já vem pré-selecionada no formulário diário.
          </Text>
          <TextInput
            style={styles.input}
            value={defaultAnswer}
            onChangeText={setDefaultAnswer}
            placeholder="Ex: Sim"
            placeholderTextColor={COLORS.muted}
          />

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={save}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>{saving ? 'Salvando...' : 'Salvar pergunta'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, gap: 12, paddingBottom: 40 },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginTop: 8 },
  hint: { fontSize: 13, color: COLORS.muted, marginTop: -8 },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    minHeight: 48,
  },

  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  typeOptionSelected: {
    borderColor: COLORS.selectedBorder,
    backgroundColor: COLORS.selected,
  },
  typeOptionText: { fontSize: 14, fontWeight: '600', color: COLORS.muted },
  typeOptionTextSelected: { color: COLORS.primary },

  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
});
