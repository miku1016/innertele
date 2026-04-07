import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PermissionGate } from './src/components/PermissionGate';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <PermissionGate>
        <RootNavigator />
      </PermissionGate>
    </>
  );
}
