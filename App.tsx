import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import DailyReportScreen from './src/screens/DailyReportScreen';
import ReportViewScreen from './src/screens/ReportViewScreen';
import QuestionsScreen from './src/screens/QuestionsScreen';
import AddEditQuestionScreen from './src/screens/AddEditQuestionScreen';
import ListasOpcoesScreen from './src/screens/ListasOpcoesScreen';
import EditarListaScreen from './src/screens/EditarListaScreen';
import { Question, OpcoesList } from './src/types';

// ── Types ─────────────────────────────────────────────────────────────────────

export type DailyReportStackParamList = {
  DailyReportForm: undefined;
  ReportView: { reportText: string };
};

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
const DRStack = createNativeStackNavigator<DailyReportStackParamList>();
const QStack = createNativeStackNavigator<QuestionsStackParamList>();
const Tab = createBottomTabNavigator();

function DailyReportStack() {
  return (
    <DRStack.Navigator screenOptions={{ headerShown: false }}>
      <DRStack.Screen name="DailyReportForm" component={DailyReportScreen} />
      <DRStack.Screen name="ReportView" component={ReportViewScreen} />
    </DRStack.Navigator>
  );
}

function QuestionsStack() {
  return (
    <QStack.Navigator>
      <QStack.Screen
        name="QuestionsList"
        component={QuestionsScreen}
        options={{ title: 'Cadastro de perguntas' }}
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
        component={DailyReportStack}
        options={{ tabBarIcon: ({ color, size }) => <Feather name="clipboard" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Cadastro"
        component={QuestionsStack}
        options={{ tabBarIcon: ({ color, size }) => <Feather name="settings" size={size} color={color} /> }}
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
      <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Main">
        <RootStack.Screen name="Welcome" component={WelcomeScreen} />
        <RootStack.Screen name="Main" component={MainTabs} />
      </RootStack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
