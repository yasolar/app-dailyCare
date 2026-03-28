import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CIRCLE = width * 0.52;

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale  = useRef(new Animated.Value(0.82)).current;

  useEffect(() => {
    Animated.sequence([
      // Entra
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(scale,  { toValue: 1, friction: 6, useNativeDriver: true }),
      ]),
      // Pausa
      Animated.delay(900),
      // Sai
      Animated.timing(opacity, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start(onFinish);
  }, []);

  return (
    <View style={styles.root}>
      {/* Círculos decorativos de fundo */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <Animated.View style={[styles.logoArea, { opacity, transform: [{ scale }] }]}>
        {/* Anel externo */}
        <View style={styles.ringOuter}>
          {/* Anel interno */}
          <View style={styles.ringInner}>
            {/* Círculo principal */}
            <View style={styles.circle}>
              <Feather name="heart" size={CIRCLE * 0.42} color="#fff" />
            </View>
          </View>
        </View>

        <Text style={styles.appName}>Daily Care</Text>
        <Text style={styles.tagline}>Cuidar com carinho, registrar com simplicidade</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#2D6A4F',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  bgCircle1: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#ffffff08',
    top: -100,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#ffffff06',
    bottom: -50,
    left: -40,
  },

  logoArea: {
    alignItems: 'center',
  },

  ringOuter: {
    width: CIRCLE + 28,
    height: CIRCLE + 28,
    borderRadius: (CIRCLE + 28) / 2,
    backgroundColor: '#ffffff10',
    borderWidth: 2,
    borderColor: '#ffffff30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  ringInner: {
    width: CIRCLE + 4,
    height: CIRCLE + 4,
    borderRadius: (CIRCLE + 4) / 2,
    backgroundColor: '#ffffff07',
    borderWidth: 1.5,
    borderColor: '#ffffff18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: '#52B788',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 13,
    color: '#ffffffaa',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 19,
  },
});
