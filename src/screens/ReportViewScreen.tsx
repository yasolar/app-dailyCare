import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DailyReportStackParamList } from '../../App';

type Props = NativeStackScreenProps<DailyReportStackParamList, 'ReportView'>;

const COLORS = {
  primary: '#2D6A4F',
  border: '#C7E8D1',
  bg: '#EAF7EE',
  text: '#111827',
  muted: '#6B7280',
  white: '#FFFFFF',
};

export default function ReportViewScreen({ route, navigation }: Props) {
  const { reportText } = route.params;

  const shareViaWhatsApp = async () => {
    try {
      await Share.share({ message: reportText });
    } catch {
      Alert.alert('Erro', 'Não foi possível compartilhar.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Relatório do dia</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Feather name="x" size={22} color={COLORS.muted} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.reportText} selectable>
          {reportText}
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.shareBtn} onPress={shareViaWhatsApp} activeOpacity={0.85}>
          <Feather name="share-2" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.shareBtnText}>Compartilhar / WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  closeBtn: { padding: 6 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  reportText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  shareBtn: {
    backgroundColor: '#25D366',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
});
