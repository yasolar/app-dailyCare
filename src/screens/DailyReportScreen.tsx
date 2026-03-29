import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

const FIXED_STEPS = 2; // date + caregiver

export default function DailyReportScreen({ navigation }: Props) {
  const tabNavigation = useNavigation<any>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<Settings>({ caregiverName: '' });
  const [listas, setListas] = useState<OpcoesList[]>([]);
  const [date, setDate] = useState(todayStr());
  const [caregiverName, setCaregiverName] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showClearModal, setShowClearModal] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      Promise.all([loadQuestions(), loadSettings(), loadListasOpcoes()]).then(([qs, st, ls]) => {
        setQuestions(qs);
        setSettings(st);
        setCaregiverName(st.caregiverName);
        setListas(ls);
        const defaults: Record<string, string> = {};
        qs.forEach((q) => {
          if (q.defaultAnswer) defaults[q.id] = q.defaultAnswer;
        });
        setAnswers((prev) => ({ ...defaults, ...prev }));
        setCurrentIndex(0);
        slideAnim.setValue(0);
      });
    }, [])
  );

  const hasNoQuestions = questions.length === 0;
  const totalCards = FIXED_STEPS + (hasNoQuestions ? 1 : questions.length);
  const isLast = currentIndex === totalCards - 1;

  const setAnswer = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const persistCaregiverName = async (name: string) => {
    const updated = { ...settings, caregiverName: name.trim() };
    setSettings(updated);
    await saveSettings(updated);
  };

  const generateReport = () => {
    const lines: string[] = [];
    lines.push(`Data: ${date}`);
    lines.push(`Cuidador(a): ${caregiverName.trim() || '___'}`);
    lines.push('');
    questions.forEach((q) => {
      const ans = answers[q.id] ?? '';
      lines.push(`${q.label}: ${ans}`);
      lines.push('');
    });
    return lines.join('\n');
  };

  const handleGenerateAndShare = async () => {
    await persistCaregiverName(caregiverName);
    const text = generateReport();
    navigation.navigate('ReportView', { reportText: text });
  };

  const animate = (direction: 'next' | 'back', onMid: () => void) => {
    const outTo = direction === 'next' ? -SCREEN_WIDTH : SCREEN_WIDTH;
    const inFrom = direction === 'next' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(slideAnim, {
      toValue: outTo,
      duration: 280,
      useNativeDriver: true,
    }).start(() => {
      onMid();
      slideAnim.setValue(inFrom);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    });
  };

  const goNext = () => {
    if (currentIndex >= totalCards - 1) return;
    // auto-save caregiver name when leaving its card
    if (currentIndex === 1) persistCaregiverName(caregiverName);
    animate('next', () => setCurrentIndex((i) => i + 1));
  };

  const goBack = () => {
    if (currentIndex <= 0) return;
    animate('back', () => setCurrentIndex((i) => i - 1));
  };

  const clearForm = () => setShowClearModal(true);

  const confirmClear = () => {
    const defaults: Record<string, string> = {};
    questions.forEach((q) => {
      if (q.defaultAnswer) defaults[q.id] = q.defaultAnswer;
    });
    setAnswers(defaults);
    setDate(todayStr());
    setCurrentIndex(0);
    slideAnim.setValue(0);
    setShowClearModal(false);
  };

  // Dot "filled" state
  const isDotFilled = (i: number) => {
    if (i === 0) return date.trim() !== '';
    if (i === 1) return caregiverName.trim() !== '';
    const q = questions[i - FIXED_STEPS];
    return q ? (answers[q.id] ?? '').trim() !== '' : false;
  };

  // Render the card content based on index
  const renderCardContent = () => {
    if (currentIndex === 0) {
      return (
        <View style={styles.questionCard}>
          <View style={styles.cardIconRow}>
            <View style={styles.cardIconBadge}>
              <Feather name="calendar" size={20} color={C.primary} />
            </View>
            <Text style={styles.cardStepTag}>Etapa obrigatória</Text>
          </View>
          <Text style={styles.questionLabel}>Qual é a data do relatório?</Text>
          <View style={styles.answerArea}>
            <TextInput
              style={styles.dateInput}
              value={date}
              onChangeText={setDate}
              keyboardType="numbers-and-punctuation"
              returnKeyType="done"
              placeholder="dd/mm/aaaa"
              placeholderTextColor={C.muted}
            />
          </View>
        </View>
      );
    }

    if (currentIndex === 1) {
      return (
        <View style={styles.questionCard}>
          <View style={styles.cardIconRow}>
            <View style={styles.cardIconBadge}>
              <Feather name="user" size={20} color={C.primary} />
            </View>
            <Text style={styles.cardStepTag}>Etapa obrigatória</Text>
          </View>
          <Text style={styles.questionLabel}>Qual é o nome da pessoa cuidadora?</Text>
          <View style={styles.answerArea}>
            <TextInput
              style={styles.dateInput}
              value={caregiverName}
              onChangeText={setCaregiverName}
              returnKeyType="done"
              placeholder="Pessoa cuidadora..."
              placeholderTextColor={C.muted}
              autoCapitalize="words"
            />
          </View>
        </View>
      );
    }

    if (hasNoQuestions && currentIndex === FIXED_STEPS) {
      return (
        <View style={styles.emptyQuestionsCard}>
          <View style={styles.emptyQuestionsIconWrap}>
            <Feather name="clipboard" size={32} color={C.primary} />
          </View>
          <Text style={styles.emptyQuestionsTitle}>Nenhuma pergunta cadastrada</Text>
          <Text style={styles.emptyQuestionsDesc}>
            Cadastre perguntas para personalizar o relatório diário de cuidados.
          </Text>
          <TouchableOpacity
            style={styles.emptyQuestionsBtn}
            onPress={() => tabNavigation.navigate('Cadastro', { screen: 'AddEditQuestion', params: { question: null } })}
            activeOpacity={0.85}
          >
            <Feather name="plus-circle" size={18} color={C.white} style={{ marginRight: 8 }} />
            <Text style={styles.emptyQuestionsBtnText}>Ir para Cadastro de Perguntas</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const q = questions[currentIndex - FIXED_STEPS];
    if (!q) return null;
    return (
      <View style={styles.questionCard}>
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
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Green header ── */}
      <View style={styles.hero}>
        <View style={styles.decorCircleLarge} />
        <View style={styles.decorCircleSmall} />
        <View style={styles.heroTop}>
          <Logo />
          <Text style={styles.heroSuper}>DAILY CARE</Text>
        </View>
      </View>

      {/* ── Content area ── */}
      <View style={styles.contentArea}>
        <View style={styles.cardFlow}>

          {/* Progress */}
          <View style={styles.progressRow}>
            <View>
              <Text style={styles.progressLabel}>
                {currentIndex < FIXED_STEPS ? 'Identificação' : 'Pergunta'}
              </Text>
              <Text style={styles.progressCount}>
                {currentIndex + 1} / {totalCards}
              </Text>
            </View>
            <TouchableOpacity onPress={clearForm} style={styles.clearBtn}>
              <Text style={styles.clearText}>Limpar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${((currentIndex + 1) / totalCards) * 100}%` },
              ]}
            />
          </View>

          {/* Dot indicators */}
          <View style={styles.dotsRow}>
            {Array.from({ length: totalCards }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === currentIndex && styles.dotActive,
                  isDotFilled(i) && i !== currentIndex && styles.dotAnswered,
                ]}
              />
            ))}
          </View>

          {/* Animated card */}
          <Animated.View style={[styles.cardWrapper, { transform: [{ translateX: slideAnim }] }]}>
            <ScrollView
              contentContainerStyle={styles.cardScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {renderCardContent()}

            </ScrollView>
          </Animated.View>

          {/* Navigation buttons */}
          <View style={styles.navRow}>
            <TouchableOpacity
              style={[styles.backBtn, currentIndex === 0 && styles.backBtnDisabled]}
              onPress={goBack}
              activeOpacity={0.7}
              disabled={currentIndex === 0}
            >
              <Feather name="arrow-left" size={20} color={currentIndex === 0 ? C.muted : C.primary} />
              <Text style={[styles.backBtnText, currentIndex === 0 && { color: C.muted }]}>Voltar</Text>
            </TouchableOpacity>

            {isLast ? (
              <TouchableOpacity
                style={[styles.generateBtn, (!caregiverName.trim() || questions.length === 0) && styles.generateBtnDisabled]}
                onPress={handleGenerateAndShare}
                activeOpacity={0.85}
                disabled={!caregiverName.trim() || questions.length === 0}
              >
                <Feather name="send" size={18} color={C.white} style={{ marginRight: 8 }} />
                <Text style={styles.generateBtnText}>Gerar Relatório</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.nextBtn}
                onPress={goNext}
                activeOpacity={0.85}
              >
                <Text style={styles.nextBtnText}>Prosseguir</Text>
                <Feather name="arrow-right" size={20} color={C.white} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            )}
          </View>

        </View>
      </View>

      {/* ── Clear confirmation modal ── */}
      <Modal visible={showClearModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIconWrap}>
              <Feather name="trash-2" size={24} color={C.primary} />
            </View>
            <Text style={styles.modalTitle}>Limpar formulário</Text>
            <Text style={styles.modalDesc}>Deseja apagar todas as respostas de hoje?</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowClearModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={confirmClear}
                activeOpacity={0.85}
              >
                <Text style={styles.modalConfirmText}>Limpar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.primary },

  // ── Hero ──
  hero: {
    backgroundColor: C.primary,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
    overflow: 'hidden',
    alignItems: 'center',
  },
  decorCircleLarge: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#ffffff0c',
    top: -60,
    right: -40,
  },
  decorCircleSmall: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff08',
    bottom: -30,
    left: -20,
  },
  heroTop: {
    alignItems: 'center',
    gap: 8,
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
  },
  heroSuper: {
    fontSize: 22,
    fontWeight: '800',
    color: C.white,
    letterSpacing: 2,
  },

  // ── Content ──
  contentArea: {
    flex: 1,
    backgroundColor: C.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },

  // ── Card flow ──
  cardFlow: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: { fontSize: 13, color: C.muted, fontWeight: '500' },
  progressCount: { fontSize: 22, fontWeight: '800', color: C.primary },
  clearBtn: { paddingVertical: 8, paddingHorizontal: 4 },
  clearText: { fontSize: 15, color: '#C0392B', fontWeight: '600' },
  progressBarBg: {
    height: 6,
    backgroundColor: C.border,
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: C.green,
    borderRadius: 3,
  },

  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.border,
  },
  dotActive: {
    backgroundColor: C.primary,
    width: 20,
    borderRadius: 4,
  },
  dotAnswered: {
    backgroundColor: C.green,
  },

  cardWrapper: {
    flex: 1,
  },
  cardScroll: {
    flexGrow: 1,
    gap: 12,
  },
  questionCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 24,
    gap: 16,
  },
  cardIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  cardStepTag: {
    fontSize: 12,
    fontWeight: '600',
    color: C.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionLabel: {
    fontSize: 19,
    fontWeight: '700',
    color: C.text,
    lineHeight: 26,
  },
  answerArea: {},
  dateInput: {
    fontSize: 17,
    fontWeight: '600',
    color: C.text,
    borderBottomWidth: 2,
    borderBottomColor: C.border,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },

  emptyQuestionsCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  emptyQuestionsIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
  },
  emptyQuestionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    textAlign: 'center',
  },
  emptyQuestionsDesc: {
    fontSize: 14,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyQuestionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 4,
    alignSelf: 'stretch',
  },
  emptyQuestionsBtnText: {
    color: C.white,
    fontSize: 15,
    fontWeight: '700',
  },

  // ── Nav buttons ──
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  backBtnDisabled: {
    borderColor: '#E5E7EB',
    backgroundColor: '#f9fafb',
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.primary,
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 16,
    gap: 6,
    elevation: 2,
    shadowColor: C.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  nextBtnText: {
    color: C.white,
    fontSize: 17,
    fontWeight: '700',
  },
  generateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 16,
    elevation: 3,
    shadowColor: C.primary,
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  generateBtnDisabled: {
    backgroundColor: '#A8D5BA',
    elevation: 0,
    shadowOpacity: 0,
  },
  generateBtnText: {
    color: C.white,
    fontSize: 17,
    fontWeight: '700',
  },

  // ── Clear modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000055',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  modalBox: {
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    gap: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
  },
  modalDesc: {
    fontSize: 14,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    backgroundColor: C.white,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.primary,
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#C0392B',
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.white,
  },
});
