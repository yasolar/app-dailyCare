import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
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
  const [currentIndex, setCurrentIndex] = useState(0);

  const slideAnim = useRef(new Animated.Value(0)).current;

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
        setCurrentIndex(0);
        slideAnim.setValue(0);
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

  const goNext = () => {
    if (currentIndex >= questions.length - 1) return;
    Animated.timing(slideAnim, {
      toValue: -SCREEN_WIDTH,
      duration: 280,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex((i) => i + 1);
      slideAnim.setValue(SCREEN_WIDTH);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    });
  };

  const goBack = () => {
    if (currentIndex <= 0) return;
    Animated.timing(slideAnim, {
      toValue: SCREEN_WIDTH,
      duration: 280,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex((i) => i - 1);
      slideAnim.setValue(-SCREEN_WIDTH);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    });
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
          setCurrentIndex(0);
          slideAnim.setValue(0);
        },
      },
    ]);
  };

  const isLast = currentIndex === questions.length - 1;
  const currentQuestion = questions[currentIndex];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Green header ── */}
      <View style={styles.hero}>
        <View style={styles.decorCircleLarge} />
        <View style={styles.decorCircleSmall} />

        <View style={styles.heroTop}>
          <Logo />
          <View style={styles.heroTitles}>
            <Text style={styles.heroSuper}>DAILY CARE</Text>
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

      {/* ── Content area ── */}
      <View style={styles.contentArea}>

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
              onPress={() => tabNavigation.navigate('Cadastro')}
              activeOpacity={0.85}
            >
              <Feather name="plus" size={18} color={C.white} style={{ marginRight: 8 }} />
              <Text style={styles.emptyBtnText}>Cadastrar perguntas</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Card flow */}
        {questions.length > 0 && currentQuestion && (
          <View style={styles.cardFlow}>
            {/* Progress */}
            <View style={styles.progressRow}>
              <View>
                <Text style={styles.progressLabel}>Pergunta</Text>
                <Text style={styles.progressCount}>
                  {currentIndex + 1} / {questions.length}
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
                  { width: `${((currentIndex + 1) / questions.length) * 100}%` },
                ]}
              />
            </View>

            {/* Dot indicators */}
            <View style={styles.dotsRow}>
              {questions.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === currentIndex && styles.dotActive,
                    (answers[questions[i].id] ?? '').trim() !== '' && i !== currentIndex && styles.dotAnswered,
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
                <View style={styles.questionCard}>
                  <Text style={styles.questionLabel}>{currentQuestion.label}</Text>
                  <View style={styles.answerArea}>
                    <AnswerInput
                      type={currentQuestion.answerType}
                      value={answers[currentQuestion.id] ?? ''}
                      onChange={(v) => setAnswer(currentQuestion.id, v)}
                      options={listas.find(l => l.id === currentQuestion.optionsListId)?.items ?? []}
                    />
                  </View>
                </View>
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
                  style={styles.generateBtn}
                  onPress={handleGenerateAndShare}
                  activeOpacity={0.85}
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
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.primary },

  // ── Hero ──
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
  },
  heroTitles: { flex: 1 },
  heroSuper: {
    fontSize: 26,
    fontWeight: '800',
    color: C.white,
    letterSpacing: 1.5,
  },
  heroField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.fieldBg,
    borderWidth: 1,
    borderColor: C.fieldBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 20,
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
  clearText: { fontSize: 15, color: '#EF4444', fontWeight: '600' },
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
  },
  questionCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 24,
    gap: 16,
  },
  questionLabel: {
    fontSize: 19,
    fontWeight: '700',
    color: C.text,
    lineHeight: 26,
  },
  answerArea: {},

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
    borderColor: C.border,
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
    backgroundColor: C.green,
    borderRadius: 14,
    paddingVertical: 16,
    elevation: 3,
    shadowColor: C.green,
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  generateBtnText: {
    color: C.white,
    fontSize: 17,
    fontWeight: '700',
  },

  // ── Empty state ──
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 10,
  },
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
});
