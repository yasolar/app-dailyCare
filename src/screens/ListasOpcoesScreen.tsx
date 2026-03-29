import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OpcoesList } from '../types';
import { loadListasOpcoes, saveListasOpcoes } from '../storage/storage';
import { QuestionsStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<QuestionsStackParamList, 'ListasOpcoes'>;

const COLORS = {
  primary: '#2D6A4F',
  danger: '#EF4444',
  border: '#C7E8D1',
  bg: '#EAF7EE',
  text: '#111827',
  muted: '#6B7280',
  white: '#FFFFFF',
  card: '#FFFFFF',
};

export default function ListasOpcoesScreen() {
  const navigation = useNavigation<Nav>();
  const [listas, setListas] = useState<OpcoesList[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadListasOpcoes().then(setListas);
    }, [])
  );

  const deletarLista = (id: string, name: string) => {
    Alert.alert('Excluir lista', `Excluir a lista "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          const updated = listas.filter((l) => l.id !== id);
          setListas(updated);
          await saveListasOpcoes(updated);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={listas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhuma lista criada.</Text>
            <Text style={styles.emptyText}>Toque em + para adicionar.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('EditarLista', { lista: item })}
            activeOpacity={0.8}
          >
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardCount}>{item.items.length} item{item.items.length !== 1 ? 's' : ''}</Text>
            </View>
            <Feather name="chevron-right" size={24} color={COLORS.muted} />
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('EditarLista', { lista: null })}
        activeOpacity={0.85}
      >
        <Feather name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  list: { padding: 16, gap: 10, paddingBottom: 90 },
  empty: { alignItems: 'center', marginTop: 60, gap: 6 },
  emptyText: { color: COLORS.muted, fontSize: 16 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  cardCount: { fontSize: 15, color: COLORS.muted, marginTop: 3 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  deleteBtn: { padding: 10 },

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
});
