import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AnswerType } from '../types';

interface Props {
  type: AnswerType;
  value: string;
  onChange: (value: string) => void;
  options?: string[]; // usado por selecao_alimentos
}

const COLORS = {
  primary: '#2D6A4F',
  sim: '#52B788',
  nao: '#EF4444',
  border: '#C7E8D1',
  bg: '#EAF7EE',
  text: '#111827',
  muted: '#6B7280',
  white: '#FFFFFF',
};

// ── Sim / Não ─────────────────────────────────────────────────────────────────

function SimNaoInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.simNaoRow}>
      <TouchableOpacity
        style={[styles.simNaoBtn, value === 'Sim' && { backgroundColor: COLORS.sim, borderColor: COLORS.sim }]}
        onPress={() => onChange(value === 'Sim' ? '' : 'Sim')}
        activeOpacity={0.8}
      >
        <Feather name="check" size={18} color={value === 'Sim' ? '#fff' : COLORS.muted} />
        <Text style={[styles.simNaoText, value === 'Sim' && styles.simNaoTextActive]}>Sim</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.simNaoBtn, value === 'Não' && { backgroundColor: COLORS.nao, borderColor: COLORS.nao }]}
        onPress={() => onChange(value === 'Não' ? '' : 'Não')}
        activeOpacity={0.8}
      >
        <Feather name="x" size={18} color={value === 'Não' ? '#fff' : COLORS.muted} />
        <Text style={[styles.simNaoText, value === 'Não' && styles.simNaoTextActive]}>Não</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Número ────────────────────────────────────────────────────────────────────

function NumeroInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const num = parseInt(value || '0', 10);

  const decrement = () => onChange(String(Math.max(0, num - 1)));
  const increment = () => onChange(String(num + 1));

  return (
    <View style={styles.numRow}>
      <TouchableOpacity style={styles.numBtn} onPress={decrement}>
        <Text style={styles.numBtnText}>−</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.numInput}
        value={value || '0'}
        onChangeText={(t) => {
          const n = parseInt(t.replace(/[^0-9]/g, ''), 10);
          onChange(isNaN(n) ? '0' : String(n));
        }}
        keyboardType="number-pad"
        textAlign="center"
      />
      <TouchableOpacity style={styles.numBtn} onPress={increment}>
        <Text style={styles.numBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Horário ───────────────────────────────────────────────────────────────────

function parseTime(s: string): { h: number; m: number } {
  const match = s.match(/^(\d{1,2}):(\d{2})$/);
  if (match) return { h: parseInt(match[1], 10), m: parseInt(match[2], 10) };
  return { h: 0, m: 0 };
}

function formatTime(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function TimePicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const { h, m } = parseTime(value);
  const [tempH, setTempH] = useState(h);
  const [tempM, setTempM] = useState(m);

  const openPicker = () => {
    const { h: ch, m: cm } = parseTime(value);
    setTempH(ch);
    setTempM(cm);
    setOpen(true);
  };

  const confirm = () => {
    onChange(formatTime(tempH, tempM));
    setOpen(false);
  };

  return (
    <>
      <TouchableOpacity style={styles.timeTrigger} onPress={openPicker}>
        {label ? <Text style={styles.timeTriggerLabel}>{label}</Text> : null}
        <Text style={[styles.timeTriggerValue, !value && { color: COLORS.muted }]}>
          {value || 'Toque para definir'}
        </Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Selecionar horário</Text>
            <View style={styles.timePickerRow}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeColLabel}>Hora</Text>
                <TouchableOpacity onPress={() => setTempH((tempH + 1) % 24)} style={styles.timeArrow}>
                  <Feather name="chevron-up" size={28} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.timeValue}>{String(tempH).padStart(2, '0')}</Text>
                <TouchableOpacity onPress={() => setTempH((tempH + 23) % 24)} style={styles.timeArrow}>
                  <Feather name="chevron-down" size={28} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.timeSep}>:</Text>
              <View style={styles.timeColumn}>
                <Text style={styles.timeColLabel}>Min</Text>
                <TouchableOpacity onPress={() => setTempM((tempM + 1) % 60)} style={styles.timeArrow}>
                  <Feather name="chevron-up" size={28} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.timeValue}>{String(tempM).padStart(2, '0')}</Text>
                <TouchableOpacity onPress={() => setTempM((tempM - 1 + 60) % 60)} style={styles.timeArrow}>
                  <Feather name="chevron-down" size={28} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setOpen(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={confirm}>
                <Text style={styles.modalConfirmText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ── Intervalo de horário ──────────────────────────────────────────────────────

function HorarioIntervaloInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  // Formato esperado: "14:00 até 17:00"
  const parts = value.split(' até ');
  const start = parts[0] || '';
  const end = parts[1] || '';

  const update = (s: string, e: string) => {
    if (s && e) onChange(`${s} até ${e}`);
    else if (s) onChange(s);
    else onChange('');
  };

  return (
    <View style={styles.intervalRow}>
      <View style={styles.intervalItem}>
        <TimePicker value={start} onChange={(v) => update(v, end)} label="De" />
      </View>
      <Text style={styles.intervalAte}>até</Text>
      <View style={styles.intervalItem}>
        <TimePicker value={end} onChange={(v) => update(start, v)} label="Até" />
      </View>
    </View>
  );
}

// ── Seleção de Alimentos ──────────────────────────────────────────────────────

function SelecaoAlimentosInput({ value, onChange, alimentos }: { value: string; onChange: (v: string) => void; alimentos: string[] }) {
  const selected = value ? value.split(', ').filter(Boolean) : [];

  const toggle = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter((s) => s !== item).join(', '));
    } else {
      onChange([...selected, item].join(', '));
    }
  };

  return (
    <View style={styles.alimentosContainer}>
      <View style={styles.alimentosGrid}>
        {alimentos.map((item) => {
          const isSelected = selected.includes(item);
          return (
            <TouchableOpacity
              key={item}
              style={[styles.alimentoChip, isSelected && styles.alimentoChipSelected]}
              onPress={() => toggle(item)}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                {isSelected && <Feather name="check" size={14} color={COLORS.primary} />}
                <Text style={[styles.alimentoChipText, isSelected && styles.alimentoChipTextSelected]}>{item}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      {selected.length > 0 && (
        <Text style={styles.alimentosSummary}>
          Selecionados: {selected.join(', ')}
        </Text>
      )}
    </View>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function AnswerInput({ type, value, onChange, options = [] }: Props) {
  switch (type) {
    case 'sim_nao':
      return <SimNaoInput value={value} onChange={onChange} />;
    case 'numero':
      return <NumeroInput value={value} onChange={onChange} />;
    case 'horario':
      return <TimePicker value={value} onChange={onChange} />;
    case 'horario_intervalo':
      return <HorarioIntervaloInput value={value} onChange={onChange} />;
    case 'texto':
      return (
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChange}
          placeholder="Escreva aqui..."
          placeholderTextColor={COLORS.muted}
        />
      );
    case 'texto_longo':
      return (
        <TextInput
          style={[styles.textInput, styles.textInputLong]}
          value={value}
          onChangeText={onChange}
          placeholder="Escreva aqui..."
          placeholderTextColor={COLORS.muted}
          multiline
          textAlignVertical="top"
        />
      );
    case 'selecao_alimentos':
      return <SelecaoAlimentosInput value={value} onChange={onChange} alimentos={options} />;
  }
}

const styles = StyleSheet.create({
  // Sim/Não
  simNaoRow: { flexDirection: 'row', gap: 12 },
  simNaoBtn: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.white,
  },
  simNaoText: { fontSize: 18, fontWeight: '600', color: COLORS.muted },
  simNaoTextActive: { color: COLORS.white },

  // Número
  numRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  numBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBtnText: { color: COLORS.white, fontSize: 28, fontWeight: '700', lineHeight: 32 },
  numInput: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    backgroundColor: COLORS.bg,
  },

  // Horário
  timeTrigger: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.bg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeTriggerLabel: { fontSize: 15, color: COLORS.muted, marginRight: 8 },
  timeTriggerValue: { fontSize: 22, fontWeight: '700', color: COLORS.text },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 28,
    width: 300,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 24 },
  timePickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeColumn: { alignItems: 'center', gap: 4 },
  timeColLabel: { fontSize: 14, color: COLORS.muted, marginBottom: 4 },
  timeArrow: { padding: 14 },
  timeValue: { fontSize: 40, fontWeight: '700', color: COLORS.text, minWidth: 66, textAlign: 'center' },
  timeSep: { fontSize: 40, fontWeight: '700', color: COLORS.text, marginTop: 24 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 28 },
  modalCancel: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  modalCancelText: { color: COLORS.muted, fontWeight: '600', fontSize: 16 },
  modalConfirm: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  modalConfirmText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },

  // Intervalo
  intervalRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  intervalItem: { flex: 1 },
  intervalAte: { fontSize: 15, color: COLORS.muted, fontWeight: '600' },

  // Seleção de Alimentos
  alimentosContainer: { gap: 10 },
  alimentosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  alimentoChip: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  alimentoChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#D8F3DC',
  },
  alimentoChipText: { fontSize: 16, fontWeight: '600', color: COLORS.muted },
  alimentoChipTextSelected: { color: COLORS.primary },
  alimentosSummary: {
    fontSize: 14,
    color: COLORS.muted,
    fontStyle: 'italic',
    marginTop: 4,
  },

  // Texto
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 17,
    color: COLORS.text,
    backgroundColor: COLORS.bg,
  },
  textInputLong: {
    minHeight: 96,
    paddingTop: 12,
  },
});
