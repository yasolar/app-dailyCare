import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DailyReportStackParamList } from '../../App';
import { Question, Settings, OpcoesList } from '../types';
import { loadQuestions, loadSettings, saveSettings, loadListasOpcoes } from '../storage/storage';
import AnswerInput from '../components/AnswerInput';

type Props = NativeStackScreenProps<DailyReportStackParamList, 'DailyReportForm'>;

const C = {
  primary: '#2D6A4F',
  primaryDark: '#1B4332',
  green: '#52B788',
  border: '#C7E8D1',
  bg: '#EAF7EE',
  text: '#111827',
  muted: '#6B7280',
  white: '#FFFFFF',
  card: '#FFFFFF',
  fieldBg: 'rgba(255,255,255,0.15)',
  fieldBorder: 'rgba(255,255,255,0.3)',
  fieldText: '#FFFFFF',
  fieldPlaceholder: 'rgba(255,255,255,0.6)',
};

function todayStr() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function Logo() {
  return (
    <View style={styles.logoOuter}>
      <View style={styles.logoInner}>
        <Feather name="heart" size={22} color="#fff" />
      </View>
    </View>
  );
}

export default function DailyReportScreen({ navigation }: Props) {
  const tabNavigation = useNavigation<any>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<Settings>({ caregiverName: '' });
  const [listas, setListas] = useState<OpcoesList[]>([]);
  const [date, setDate] = useState(todayStr());
  const [editingDate, setEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  useFocusEffect(
    useCallback(() => {
      Promise.all([loadQuestions(), loadSettings(), loadListasOpcoes()]).then(([qs, st, ls]) => {
        setQuestions(qs);
        setSettings(st);
        setListas(ls);
        const defaults: Record<string, string> = {};
        qs.forEach((q) => {
          if (q.defaultAnswer) defaults[q.id] = q.defaultAnswer;
        });
        setAnswers((prev) => ({ ...defaults, ...prev }));
      });
    }, [])
  );

  const setAnswer = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const saveName = async () => {
    const updated = { ...settings, caregiverName: tempName.trim() };
    setSettings(updated);
    await saveSettings(updated);
    setEditingName(false);
  };

  const generateReport = () => {
    const lines: string[] = [];
    lines.push(`Data: ${date}`);
    lines.push(`Cuidador(a): ${settings.caregiverName || '___'}`);
    lines.push('');
    questions.forEach((q) => {
      const ans = answers[q.id] ?? '';
      lines.push(`${q.label}: ${ans}`);
      lines.push('');
    });
    return lines.join('\n');
  };

  const handleGenerateAndShare = () => {
    const text = generateReport();
    navigation.navigate('ReportView', { reportText: text });
  };

  const clearForm = () => {
    Alert.alert('Limpar formulário', 'Deseja apagar todas as respostas de hoje?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpar',
        style: 'destructive',
        onPress: () => {
          const defaults: Record<string, string> = {};
          questions.forEach((q) => {
            if (q.defaultAnswer) defaults[q.id] = q.defaultAnswer;
          });
          setAnswers(defaults);
        },
      },
    ]);
  };

  const answeredCount = questions.filter((q) => (answers[q.id] ?? '').trim() !== '').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Green header ── */}
      <View style={styles.hero}>
        {/* Decorative circles */}
        <View style={styles.decorCircleLarge} />
        <View style={styles.decorCircleSmall} />

        {/* Top row: logo + app name */}
        <View style={styles.heroTop}>
          <Logo />
          <View style={styles.heroTitles}>
            <Text style={styles.heroSuper}>DAILY CARE</Text>
            <Text style={styles.heroTitle}>Daily Health Report</Text>
          </View>
        </View>

        {/* Date field */}
        <View style={styles.heroField}>
          <Feather name="calendar" size={20} color="rgba(255,255,255,0.8)" />
          {editingDate ? (
            <TextInput
              style={styles.heroFieldInput}
              value={tempDate}
              onChangeText={setTempDate}
              autoFocus
              returnKeyType="done"
              keyboardType="numbers-and-punctuation"
              placeholderTextColor={C.fieldPlaceholder}
              onSubmitEditing={() => { setDate(tempDate.trim() || todayStr()); setEditingDate(false); }}
            />
          ) : (
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => { setTempDate(date); setEditingDate(true); }}
              activeOpacity={0.7}
            >
              <Text style={styles.heroFieldValue}>{date}</Text>
            </TouchableOpacity>
          )}
          {editingDate ? (
            <TouchableOpacity
              style={styles.heroFieldBtn}
              onPress={() => { setDate(tempDate.trim() || todayStr()); setEditingDate(false); }}
            >
              <Text style={styles.heroFieldBtnText}>OK</Text>
            </TouchableOpacity>
          ) : (
            <Feather name="edit-2" size={16} color="rgba(255,255,255,0.5)" />
          )}
        </View>

        {/* Caregiver field */}
        <View style={styles.heroField}>
          <Feather name="user" size={20} color="rgba(255,255,255,0.8)" />
          {editingName ? (
            <TextInput
              style={styles.heroFieldInput}
              value={tempName}
              onChangeText={setTempName}
              autoFocus
              returnKeyType="done"
              placeholder="Nome da cuidadora..."
              placeholderTextColor={C.fieldPlaceholder}
              onSubmitEditing={saveName}
            />
          ) : (
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => { setTempName(settings.caregiverName); setEditingName(true); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.heroFieldValue, !settings.caregiverName && { color: C.fieldPlaceholder }]}>
                {settings.caregiverName || 'Toque para definir nome...'}
              </Text>
            </TouchableOpacity>
          )}
          {editingName ? (
            <TouchableOpacity style={styles.heroFieldBtn} onPress={saveName}>
              <Text style={styles.heroFieldBtnText}>OK</Text>
            </TouchableOpacity>
          ) : (
            <Feather name="edit-2" size={16} color="rgba(255,255,255,0.5)" />
          )}
        </View>
      </View>

      {/* ── White content area ── */}
      <View style={styles.contentArea}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Progress row */}
          {questions.length > 0 && (
            <>
              <View style={styles.progressRow}>
                <View>
                  <Text style={styles.progressLabel}>Progresso</Text>
                  <Text style={styles.progressCount}>
                    {answeredCount} / {questions.length}
                  </Text>
                </View>
                <TouchableOpacity onPress={clearForm} style={styles.clearBtn}>
                  <Text style={styles.clearText}>Limpar</Text>
                </TouchableOpacity>
              </View>

              {/* Progress bar */}
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: questions.length > 0 ? `${(answeredCount / questions.length) * 100}%` : '0%' },
                  ]}
                />
              </View>
            </>
          )}

          {/* Questions */}
          {questions.map((q) => (
            <View key={q.id} style={styles.questionCard}>
              <Text style={styles.questionLabel}>{q.label}</Text>
              <View style={styles.answerArea}>
                <AnswerInput
                  type={q.answerType}
                  value={answers[q.id] ?? ''}
                  onChange={(v) => setAnswer(q.id, v)}
                  options={listas.find(l => l.id === q.optionsListId)?.items ?? []}
                />
              </View>
            </View>
          ))}

          {/* Empty state */}
          {questions.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Feather name="clipboard" size={52} color={C.border} />
              </View>
              <Text style={styles.emptyTitle}>Nenhuma pergunta cadastrada</Text>
              <Text style={styles.emptyText}>
                Adicione as perguntas do relatório diário para começar.
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => tabNavigation.navigate('Perguntas')}
                activeOpacity={0.85}
              >
                <Feather name="plus" size={18} color={C.white} style={{ marginRight: 8 }} />
              <Text style={styles.emptyBtnText}>Cadastrar perguntas</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Generate button */}
          {questions.length > 0 && (
            <TouchableOpacity
              style={styles.generateBtn}
              onPress={handleGenerateAndShare}
              activeOpacity={0.85}
            >
              <Feather name="send" size={20} color={C.white} style={{ marginRight: 10 }} />
              <Text style={styles.generateBtnText}>Gerar Relatório</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.primary },

  // ── Hero (green header) ──
  hero: {
    backgroundColor: C.primary,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  decorCircleLarge: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#ffffff0c',
    top: -70,
    right: -50,
  },
  decorCircleSmall: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ffffff08',
    bottom: -30,
    left: -20,
  },

  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  logoOuter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff40',
  },
  logoInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroTitles: { flex: 1 },
  heroSuper: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 2,
    marginBottom: 2,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.white,
    letterSpacing: 0.2,
  },

  heroField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.fieldBg,
    borderWidth: 1,
    borderColor: C.fieldBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    gap: 10,
  },
  heroFieldValue: {
    fontSize: 17,
    fontWeight: '600',
    color: C.fieldText,
  },
  heroFieldInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: C.fieldText,
    padding: 0,
  },
  heroFieldBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  heroFieldBtnText: { color: C.white, fontWeight: '700', fontSize: 15 },

  // ── White content ──
  contentArea: {
    flex: 1,
    backgroundColor: C.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  scroll: { padding: 20, gap: 14, paddingBottom: 40 },

  // Progress
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: { fontSize: 13, color: C.muted, fontWeight: '500' },
  progressCount: { fontSize: 22, fontWeight: '800', color: C.primary },
  clearBtn: { paddingVertical: 8, paddingHorizontal: 4 },
  clearText: { fontSize: 15, color: '#EF4444', fontWeight: '600' },

  progressBarBg: {
    height: 6,
    backgroundColor: C.border,
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: C.green,
    borderRadius: 3,
  },

  // Question cards
  questionCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 20,
    gap: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  questionLabel: { fontSize: 17, fontWeight: '600', color: C.text, lineHeight: 24 },
  answerArea: {},

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyIcon: { marginBottom: 4 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: C.text, textAlign: 'center' },
  emptyText: { fontSize: 15, color: C.muted, textAlign: 'center', lineHeight: 22, paddingHorizontal: 16 },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: C.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emptyBtnText: { color: C.white, fontSize: 17, fontWeight: '700' },

  // Generate button
  generateBtn: {
    backgroundColor: C.green,
    borderRadius: 14,
    paddingVertical: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 3,
    shadowColor: C.green,
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  generateBtnText: { color: C.white, fontSize: 20, fontWeight: '700' },
});
