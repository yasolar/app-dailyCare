import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

// ── Colors ───────────────────────────────────────────────────────────────────

const C = {
  bg: '#EAF7EE',
  primary: '#2D6A4F',
  secondary: '#52B788',
  light: '#95D5B2',
  lighter: '#D8F3DC',
  white: '#FFFFFF',
  textDark: '#1B4332',
  textMid: '#40916C',
  textLight: '#74C69D',
  shadow: '#1B433220',
};

const { height } = Dimensions.get('window');

// ── Feature item ──────────────────────────────────────────────────────────────

function Feature({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIconBox}>
        <Text style={styles.featureIcon}>{icon}</Text>
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.root}>
      {/* ── Hero ── */}
      <View style={styles.hero}>
        {/* Decorative circles */}
        <View style={styles.decorCircleLarge} />
        <View style={styles.decorCircleSmall} />

        {/* Logo */}
        <View style={styles.logoWrapper}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <Text style={styles.logoLeaf}>🌿</Text>
              <Text style={styles.logoHeart}>♥</Text>
            </View>
          </View>
        </View>

        {/* App name */}
        <Text style={styles.appName}>Daily Care</Text>
        <Text style={styles.tagline}>Cuidar com carinho, registrar com simplicidade</Text>
      </View>

      {/* ── Info card ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Seu assistente de cuidados diários</Text>
        <Text style={styles.cardSub}>
          Acompanhe a saúde e o bem-estar do seu familiar de forma simples e organizada.
        </Text>

        <View style={styles.divider} />

        <Feature icon="📋" text="Formulário diário personalizado" />
        <Feature icon="💊" text="Controle de medicamentos e rotina" />
        <Feature icon="📤" text="Relatórios prontos para compartilhar" />
        <Feature icon="🔒" text="Dados salvos localmente com segurança" />

        <TouchableOpacity
          style={styles.btn}
          activeOpacity={0.85}
          onPress={() => navigation.replace('Main')}
        >
          <Text style={styles.btnText}>Começar</Text>
          <Text style={styles.btnArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const HERO_H = height * 0.38;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Hero
  hero: {
    height: HERO_H,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  decorCircleLarge: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#ffffff0f',
    top: -80,
    right: -60,
  },
  decorCircleSmall: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#ffffff0a',
    bottom: -30,
    left: -30,
  },

  // Logo
  logoWrapper: {
    marginBottom: 16,
  },
  logoOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff40',
  },
  logoInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: C.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoLeaf: {
    fontSize: 32,
    lineHeight: 38,
  },
  logoHeart: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },

  // Titles
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: C.white,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 13,
    color: '#ffffffb0',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 18,
  },

  // Card
  card: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
    backgroundColor: C.white,
    borderRadius: 28,
    padding: 24,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 8,
  },
  cardSub: {
    fontSize: 14,
    color: C.textMid,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: C.lighter,
    marginVertical: 16,
  },

  // Features
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.lighter,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureIcon: {
    fontSize: 18,
  },
  featureText: {
    fontSize: 14,
    color: C.textDark,
    fontWeight: '500',
    flex: 1,
  },

  // Button
  btn: {
    marginTop: 20,
    backgroundColor: C.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  btnText: {
    color: C.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  btnArrow: {
    color: C.light,
    fontSize: 18,
    marginLeft: 8,
    fontWeight: '700',
  },
});
