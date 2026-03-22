import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  TextInput,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Question, Settings, OpcoesList } from '../types';
import { loadQuestions, loadSettings, saveSettings, loadListasOpcoes } from '../storage/storage';
import AnswerInput from '../components/AnswerInput';

const COLORS = {
  primary: '#2D6A4F',
  green: '#52B788',
  border: '#C7E8D1',
  bg: '#EAF7EE',
  text: '#111827',
  muted: '#6B7280',
  white: '#FFFFFF',
  card: '#FFFFFF',
  header: '#1B4332',
};

function todayStr() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function DailyReportScreen() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<Settings>({ caregiverName: '' });
  const [listas, setListas] = useState<OpcoesList[]>([]);
  const [date, setDate] = useState(todayStr());
  const [editingDate, setEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [reportText, setReportText] = useState('');
  const [showReport, setShowReport] = useState(false);

  useFocusEffect(
    useCallback(() => {
      Promise.all([loadQuestions(), loadSettings(), loadListasOpcoes()]).then(([qs, st, ls]) => {
        setQuestions(qs);
        setSettings(st);
        setListas(ls);
        // Pre-fill defaults
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
    lines.push(`Cuidadora: ${settings.caregiverName || '___'}`);
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
    setReportText(text);
    setShowReport(true);
  };

  const shareViaWhatsApp = async () => {
    try {
      await Share.share({ message: reportText });
    } catch {
      Alert.alert('Erro', 'Não foi possível compartilhar.');
    }
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
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📅 Data</Text>
            {editingDate ? (
              <View style={styles.nameEditRow}>
                <TextInput
                  style={styles.nameInput}
                  value={tempDate}
                  onChangeText={setTempDate}
                  autoFocus
                  returnKeyType="done"
                  keyboardType="numbers-and-punctuation"
                  onSubmitEditing={() => { setDate(tempDate.trim() || todayStr()); setEditingDate(false); }}
                />
                <TouchableOpacity
                  style={styles.nameSaveBtn}
                  onPress={() => { setDate(tempDate.trim() || todayStr()); setEditingDate(false); }}
                >
                  <Text style={styles.nameSaveBtnText}>OK</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => { setTempDate(date); setEditingDate(true); }}>
                <Text style={styles.infoValue}>{date}</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>👩 Cuidadora</Text>
            {editingName ? (
              <View style={styles.nameEditRow}>
                <TextInput
                  style={styles.nameInput}
                  value={tempName}
                  onChangeText={setTempName}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={saveName}
                />
                <TouchableOpacity style={styles.nameSaveBtn} onPress={saveName}>
                  <Text style={styles.nameSaveBtnText}>OK</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setTempName(settings.caregiverName);
                  setEditingName(true);
                }}
              >
                <Text style={[styles.infoValue, !settings.caregiverName && { color: COLORS.muted }]}>
                  {settings.caregiverName || 'Toque para editar'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            {answeredCount}/{questions.length} respostas preenchidas
          </Text>
          <TouchableOpacity onPress={clearForm}>
            <Text style={styles.clearText}>Limpar</Text>
          </TouchableOpacity>
        </View>

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

        {questions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Nenhuma pergunta cadastrada</Text>
            <Text style={styles.emptyStateText}>
              Vá para a aba "Perguntas" e cadastre as perguntas do relatório.
            </Text>
          </View>
        )}

        {/* Generate button */}
        {questions.length > 0 && (
          <TouchableOpacity style={styles.generateBtn} onPress={handleGenerateAndShare} activeOpacity={0.85}>
            <Text style={styles.generateBtnText}>📋 Gerar Relatório</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Report Modal */}
      <Modal visible={showReport} animationType="slide">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Relatório do dia</Text>
            <TouchableOpacity onPress={() => setShowReport(false)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.reportScroll} contentContainerStyle={{ padding: 20 }}>
            <Text style={styles.reportText} selectable>
              {reportText}
            </Text>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.shareBtn} onPress={shareViaWhatsApp} activeOpacity={0.85}>
              <Text style={styles.shareBtnText}>📤 Compartilhar / WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },

  // Info card (date + caregiver)
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 14, color: COLORS.muted, fontWeight: '500' },
  infoValue: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  infoDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },

  nameEditRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameInput: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 15,
    color: COLORS.text,
    minWidth: 140,
  },
  nameSaveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  nameSaveBtnText: { color: COLORS.white, fontWeight: '700' },

  // Progress
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 },
  progressText: { fontSize: 13, color: COLORS.muted },
  clearText: { fontSize: 13, color: '#EF4444', fontWeight: '600' },

  // Question cards
  questionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  questionLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text, lineHeight: 20 },
  answerArea: {},

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyStateTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptyStateText: { fontSize: 14, color: COLORS.muted, textAlign: 'center' },

  // Generate button
  generateBtn: {
    backgroundColor: COLORS.green,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    elevation: 3,
    shadowColor: COLORS.green,
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  generateBtnText: { color: COLORS.white, fontSize: 18, fontWeight: '700' },

  // Report modal
  modalSafe: { flex: 1, backgroundColor: COLORS.white },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  modalClose: { padding: 6 },
  modalCloseText: { fontSize: 20, color: COLORS.muted },

  reportScroll: { flex: 1 },
  reportText: { fontSize: 14, color: COLORS.text, lineHeight: 22, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  modalFooter: { padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  shareBtn: {
    backgroundColor: '#25D366',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  shareBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
});
