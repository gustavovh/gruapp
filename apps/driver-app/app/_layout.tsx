import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0a0a0a',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#0a0a0a',
          }
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Jobs' }} />
        <Stack.Screen name="history" options={{ title: 'Log' }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
