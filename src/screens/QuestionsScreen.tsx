import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  ScrollView,
  GestureResponderEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Question } from '../types';
import { loadQuestions, saveQuestions } from '../storage/storage';
import { QuestionsStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<QuestionsStackParamList, 'QuestionsList'>;

const COLORS = {
  primary: '#3B82F6',
  danger: '#EF4444',
  border: '#E5E7EB',
  bg: '#F3F4F6',
  text: '#111827',
  muted: '#6B7280',
  white: '#FFFFFF',
  card: '#FFFFFF',
};

const TYPE_ICONS: Record<string, string> = {
  sim_nao: '✓✗',
  numero: '123',
  texto: 'abc',
  texto_longo: '¶',
  horario: '⏰',
  horario_intervalo: '⏱',
  selecao_alimentos: '🍽',
};

export default function QuestionsScreen() {
  const navigation = useNavigation<Nav>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const dragAnimY = useRef(new Animated.Value(0)).current;
  const listContainerRef = useRef<View>(null);
  const listTopY = useRef(0);
  const scrollOffset = useRef(0);

  // Refs to avoid stale closures inside responder callbacks
  const draggingIndexRef = useRef<number | null>(null);
  const hoverIndexRef = useRef<number | null>(null);
  const questionsRef = useRef<Question[]>([]);
  const rowYs = useRef<number[]>([]);   // Y of each row in scroll content
  const rowHs = useRef<number[]>([]);   // height of each row

  questionsRef.current = questions;

  useFocusEffect(
    useCallback(() => {
      loadQuestions().then(setQuestions);
    }, [])
  );

  // Measure the list container's pageY so we can convert pageY → content Y
  const measureList = () => {
    listContainerRef.current?.measure((_x, _y, _w, _h, _px, pageY) => {
      listTopY.current = pageY;
    });
  };

  const deleteQuestion = (id: string) => {
    Alert.alert('Excluir pergunta', 'Tem certeza que deseja excluir esta pergunta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          const updated = questionsRef.current
            .filter((q) => q.id !== id)
            .map((q, i) => ({ ...q, order: i + 1 }));
          setQuestions(updated);
          await saveQuestions(updated);
        },
      },
    ]);
  };

  // Find which row index the finger is closest to
  const calcHoverIndex = (pageY: number): number => {
    const contentY = pageY - listTopY.current + scrollOffset.current;
    const qs = questionsRef.current;
    let best = 0;
    let minDist = Infinity;
    for (let i = 0; i < qs.length; i++) {
      const cy = (rowYs.current[i] ?? 0) + (rowHs.current[i] ?? 60) / 2;
      const dist = Math.abs(contentY - cy);
      if (dist < minDist) { minDist = dist; best = i; }
    }
    return best;
  };

  const onDragStart = (index: number, pageY: number) => {
    measureList();
    draggingIndexRef.current = index;
    hoverIndexRef.current = index;
    setDraggingIndex(index);
    setHoverIndex(index);
    const relY = pageY - listTopY.current + scrollOffset.current - (rowHs.current[index] ?? 60) / 2;
    dragAnimY.setValue(relY);
  };

  const onDragMove = (pageY: number) => {
    if (draggingIndexRef.current === null) return;
    const draggedH = rowHs.current[draggingIndexRef.current] ?? 60;
    const relY = pageY - listTopY.current + scrollOffset.current - draggedH / 2;
    dragAnimY.setValue(relY);
    const newHover = calcHoverIndex(pageY);
    if (newHover !== hoverIndexRef.current) {
      hoverIndexRef.current = newHover;
      setHoverIndex(newHover);
    }
  };

  const onDragEnd = async () => {
    const fromIdx = draggingIndexRef.current;
    const toIdx = hoverIndexRef.current;
    draggingIndexRef.current = null;
    hoverIndexRef.current = null;
    setDraggingIndex(null);
    setHoverIndex(null);

    if (fromIdx !== null && toIdx !== null && fromIdx !== toIdx) {
      const updated = [...questionsRef.current];
      const [removed] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, removed);
      const reordered = updated.map((q, i) => ({ ...q, order: i + 1 }));
      setQuestions(reordered);
      await saveQuestions(reordered);
    }
  };

  // Responder props for each drag handle — uses the native responder system
  const dragHandleProps = (index: number) => ({
    onStartShouldSetResponder: () => true,
    onMoveShouldSetResponder: () => true,
    onResponderGrant: (e: GestureResponderEvent) => onDragStart(index, e.nativeEvent.pageY),
    onResponderMove: (e: GestureResponderEvent) => onDragMove(e.nativeEvent.pageY),
    onResponderRelease: onDragEnd,
    onResponderTerminate: onDragEnd,
  });

  const draggingQuestion = draggingIndex !== null ? questions[draggingIndex] : null;

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity
        style={styles.banner}
        onPress={() => navigation.navigate('ListasOpcoes')}
        activeOpacity={0.8}
      >
        <Text style={styles.bannerText}>📋 Gerenciar listas de opções</Text>
        <Text style={styles.bannerArrow}>›</Text>
      </TouchableOpacity>

      <View
        ref={listContainerRef}
        style={{ flex: 1 }}
        onLayout={measureList}
      >
        <ScrollView
          scrollEnabled={draggingIndex === null}
          onScroll={(e) => { scrollOffset.current = e.nativeEvent.contentOffset.y; }}
          scrollEventThrottle={16}
          contentContainerStyle={styles.list}
        >
          {questions.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nenhuma pergunta cadastrada.</Text>
              <Text style={styles.emptyText}>Toque em + para adicionar.</Text>
            </View>
          )}

          {questions.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.row,
                hoverIndex === index && draggingIndex !== null && draggingIndex !== index
                  && styles.rowHighlight,
              ]}
              onLayout={(e) => {
                rowYs.current[index] = e.nativeEvent.layout.y;
                rowHs.current[index] = e.nativeEvent.layout.height;
              }}
            >
              {/* Drag handle — outside the card, left side */}
              <View style={styles.dragHandle} {...dragHandleProps(index)}>
                <Text style={[styles.dragHandleIcon, draggingIndex === index && styles.dragHandleIconActive]}>
                  ⠿
                </Text>
              </View>

              {/* Card */}
              <View style={[styles.card, draggingIndex === index && styles.cardDimmed]}>
                <View style={styles.cardLeft}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{TYPE_ICONS[item.answerType]}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardLabel} numberOfLines={2}>{item.label}</Text>
                    {item.defaultAnswer ? (
                      <Text style={styles.cardDefault}>Padrão: {item.defaultAnswer}</Text>
                    ) : null}
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('AddEditQuestion', { question: item })}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionBtnText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteQuestion(item.id)} style={styles.actionBtn}>
                    <Text style={styles.actionBtnText}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Floating copy of the dragged item */}
        {draggingQuestion && (
          <Animated.View
            pointerEvents="none"
            style={[styles.floatingRow, { top: dragAnimY }]}
          >
            <View style={styles.dragHandle}>
              <Text style={[styles.dragHandleIcon, styles.dragHandleIconActive]}>⠿</Text>
            </View>
            <View style={[styles.card, styles.cardFloating]}>
              <View style={styles.cardLeft}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{TYPE_ICONS[draggingQuestion.answerType]}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardLabel} numberOfLines={2}>{draggingQuestion.label}</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditQuestion', { question: null })}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  list: { paddingVertical: 12, paddingRight: 16, paddingLeft: 4, gap: 8, paddingBottom: 90 },
  empty: { alignItems: 'center', marginTop: 60, gap: 6 },
  emptyText: { color: COLORS.muted, fontSize: 16 },

  row: { flexDirection: 'row', alignItems: 'center' },
  rowHighlight: { borderTopWidth: 2, borderTopColor: COLORS.primary },

  dragHandle: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  dragHandleIcon: { fontSize: 22, color: '#C4C9D4', lineHeight: 26 },
  dragHandleIconActive: { color: COLORS.primary },

  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardDimmed: { opacity: 0.25 },
  cardFloating: {
    elevation: 10,
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },

  cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  typeBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadgeText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  cardInfo: { flex: 1 },
  cardLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  cardDefault: { fontSize: 12, color: COLORS.muted, marginTop: 2 },

  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBtn: { padding: 6 },
  actionBtnText: { fontSize: 18 },

  floatingRow: {
    position: 'absolute',
    left: 0,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  bannerText: { fontSize: 15, fontWeight: '600', color: COLORS.primary },
  bannerArrow: { fontSize: 22, color: COLORS.primary, fontWeight: '300' },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabText: { color: COLORS.white, fontSize: 32, lineHeight: 36 },
});
