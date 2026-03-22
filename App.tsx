import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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

// ── Stacks ────────────────────────────────────────────────────────────────────

const Stack = createNativeStackNavigator<QuestionsStackParamList>();
const Tab = createBottomTabNavigator();

function QuestionsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="QuestionsList"
        component={QuestionsScreen}
        options={{ title: 'Perguntas' }}
      />
      <Stack.Screen
        name="AddEditQuestion"
        component={AddEditQuestionScreen}
        options={({ route }) =>
          ({ title: route.params?.question ? 'Editar pergunta' : 'Nova pergunta' })
        }
      />
      <Stack.Screen
        name="ListasOpcoes"
        component={ListasOpcoesScreen}
        options={{ title: 'Gerenciar listas de opções' }}
      />
      <Stack.Screen
        name="EditarLista"
        component={EditarListaScreen}
        options={({ route }) =>
          ({ title: route.params?.lista ? 'Editar lista' : 'Nova lista' })
        }
      />
    </Stack.Navigator>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#3B82F6',
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
    </NavigationContainer>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
