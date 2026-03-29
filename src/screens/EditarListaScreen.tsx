import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const confirmDeletar = async () => {
    if (!existing) return;
    const listas = await loadListasOpcoes();
    await saveListasOpcoes(listas.filter((l) => l.id !== existing.id));
    navigation.goBack();
  };

  const salvar = async () => {
    if (!nome.trim()) return;
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
    if (items.some((i) => i.toLowerCase() === item.toLowerCase())) return;
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
          {existing && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => setShowDeleteModal(true)}
              activeOpacity={0.85}
            >
              <Feather name="trash-2" size={18} color={COLORS.danger} />
            </TouchableOpacity>
          )}
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

      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIconWrap}>
              <Feather name="trash-2" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.modalTitle}>Excluir lista</Text>
            <Text style={styles.modalDesc}>
              Deseja excluir a lista "{existing?.name}"? Esta ação não pode ser desfeita.
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowDeleteModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={confirmDeletar}
                activeOpacity={0.85}
              >
                <Text style={styles.modalConfirmText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  deleteBtn: {
    width: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },

  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000055',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  modalBox: {
    backgroundColor: COLORS.white,
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
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  modalDesc: {
    fontSize: 14,
    color: COLORS.muted,
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
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
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
    color: COLORS.white,
  },
});
