import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { CameraScreen } from '../screens/CameraScreen';
import { MapScreen } from '../screens/MapScreen';
import { GalleryScreen } from '../screens/GalleryScreen';
import { PhotoDetailScreen } from '../screens/PhotoDetailScreen';
import { RootStackParamList, TabParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Camera: '📷',
    Map: '🗺️',
    Gallery: '🖼️',
  };
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
      {icons[name] ?? '?'}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarStyle: {
          backgroundColor: '#16213e',
          borderTopColor: '#2a2a4e',
        },
        tabBarActiveTintColor: '#4a90d9',
        tabBarInactiveTintColor: '#666688',
        headerStyle: { backgroundColor: '#16213e' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen
        name="Camera"
        component={CameraScreen}
        options={{ title: 'カメラ', headerShown: false }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ title: 'マップ' }}
      />
      <Tab.Screen
        name="Gallery"
        component={GalleryScreen}
        options={{ title: 'ギャラリー' }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#16213e' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#1a1a2e' },
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PhotoDetail"
          component={PhotoDetailScreen}
          options={{ title: '写真の詳細' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
