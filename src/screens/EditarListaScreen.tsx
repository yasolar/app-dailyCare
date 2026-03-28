import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OpcoesList } from '../types';
import { loadListasOpcoes, saveListasOpcoes } from '../storage/storage';
import { QuestionsStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<QuestionsStackParamList, 'EditarLista'>;
type Route = RouteProp<QuestionsStackParamList, 'EditarLista'>;

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

export default function EditarListaScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const existing = route.params?.lista ?? null;

  const [nome, setNome] = useState(existing?.name ?? '');
  const [items, setItems] = useState<string[]>(existing?.items ?? []);
  const [novoItem, setNovoItem] = useState('');
  const [saving, setSaving] = useState(false);

  const salvar = async () => {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'Digite um nome para a lista.');
      return;
    }
    setSaving(true);
    const listas = await loadListasOpcoes();
    if (existing) {
      const updated = listas.map((l) =>
        l.id === existing.id ? { ...l, name: nome.trim(), items } : l
      );
      await saveListasOpcoes(updated);
    } else {
      const newLista: OpcoesList = {
        id: Date.now().toString(),
        name: nome.trim(),
        items,
      };
      await saveListasOpcoes([...listas, newLista]);
    }
    setSaving(false);
    navigation.goBack();
  };

  const adicionarItem = () => {
    const item = novoItem.trim();
    if (!item) return;
    if (items.some((i) => i.toLowerCase() === item.toLowerCase())) {
      Alert.alert('Atenção', 'Este item já está na lista.');
      return;
    }
    setItems([...items, item]);
    setNovoItem('');
  };

  const removerItem = (item: string) => {
    setItems(items.filter((i) => i !== item));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={styles.nameSection}>
          <Text style={styles.nameLabel}>Nome da lista</Text>
          <TextInput
            style={styles.nameInput}
            value={nome}
            onChangeText={setNome}
            placeholder="Ex: Almoço, Sobremesa..."
            placeholderTextColor={COLORS.muted}
          />
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nenhum item. Adicione abaixo.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardText}>{item}</Text>
              <TouchableOpacity onPress={() => removerItem(item)} style={styles.removeBtn}>
                <Feather name="x" size={18} color={COLORS.muted} />
              </TouchableOpacity>
            </View>
          )}
        />

        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput}
            value={novoItem}
            onChangeText={setNovoItem}
            placeholder="Novo item..."
            placeholderTextColor={COLORS.muted}
            returnKeyType="done"
            onSubmitEditing={adicionarItem}
          />
          <TouchableOpacity
            style={[styles.addBtn, !novoItem.trim() && styles.addBtnDisabled]}
            onPress={adicionarItem}
            disabled={!novoItem.trim()}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={salvar}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>{saving ? 'Salvando...' : 'Salvar lista'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  nameSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  nameLabel: { fontSize: 13, fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  nameInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    backgroundColor: COLORS.bg,
  },

  list: { padding: 12, gap: 8, paddingBottom: 16 },
  empty: { alignItems: 'center', marginTop: 24 },
  emptyText: { color: COLORS.muted, fontSize: 14 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  cardText: { fontSize: 15, fontWeight: '500', color: COLORS.text },
  removeBtn: { padding: 4 },

  addRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  addInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.bg,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: { opacity: 0.4 },

  footer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
});
