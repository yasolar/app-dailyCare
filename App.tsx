import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import DailyReportScreen from './src/screens/DailyReportScreen';
import QuestionsScreen from './src/screens/QuestionsScreen';
import AddEditQuestionScreen from './src/screens/AddEditQuestionScreen';
import ListasOpcoesScreen from './src/screens/ListasOpcoesScreen';
import EditarListaScreen from './src/screens/EditarListaScreen';
import { Question, OpcoesList } from './src/types';

// ── Types ─────────────────────────────────────────────────────────────────────

export type QuestionsStackParamList = {
  QuestionsList: undefined;
  AddEditQuestion: { question: Question | null };
  ListasOpcoes: undefined;
  EditarLista: { lista: OpcoesList | null };
};

type RootStackParamList = {
  Welcome: undefined;
  Main: undefined;
};

// ── Stacks ────────────────────────────────────────────────────────────────────

const RootStack = createNativeStackNavigator<RootStackParamList>();
const QStack = createNativeStackNavigator<QuestionsStackParamList>();
const Tab = createBottomTabNavigator();

function QuestionsStack() {
  return (
    <QStack.Navigator>
      <QStack.Screen
        name="QuestionsList"
        component={QuestionsScreen}
        options={{ title: 'Perguntas' }}
      />
      <QStack.Screen
        name="AddEditQuestion"
        component={AddEditQuestionScreen}
        options={({ route }) =>
          ({ title: route.params?.question ? 'Editar pergunta' : 'Nova pergunta' })
        }
      />
      <QStack.Screen
        name="ListasOpcoes"
        component={ListasOpcoesScreen}
        options={{ title: 'Gerenciar listas de opções' }}
      />
      <QStack.Screen
        name="EditarLista"
        component={EditarListaScreen}
        options={({ route }) =>
          ({ title: route.params?.lista ? 'Editar lista' : 'Nova lista' })
        }
      />
    </QStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2D6A4F',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Relatório"
        component={DailyReportScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📋</Text> }}
      />
      <Tab.Screen
        name="Perguntas"
        component={QuestionsStack}
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚙️</Text> }}
      />
    </Tab.Navigator>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  if (!splashDone) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <SplashScreen onFinish={() => setSplashDone(true)} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
    <NavigationContainer>
      <StatusBar style="light" />
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Welcome" component={WelcomeScreen} />
        <RootStack.Screen name="Main" component={MainTabs} />
      </RootStack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
