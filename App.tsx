import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import WalletScreen from './src/components/WalletScreen';
import ProfileScreen from './src/components/ProfileScreen';
import LoginScreen from './src/components/LoginScreen';
import { AppContext, AppProvider } from './src/context/AppContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types/navigation';
import RegisterScreen from './src/components/RegisterScreen';

const Tab = createBottomTabNavigator();


const Stack = createNativeStackNavigator<RootStackParamList>(); 

const MainTabs = () => (
  <Tab.Navigator>
    <Tab.Screen 
      name="Cüzdan" 
      component={WalletScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons
  name="wallet-outline"
  size={typeof size === 'number' ? size : 24}
  color={color || 'black'}
/>
        ),
      }}
    />
    <Tab.Screen 
      name="Profil" 
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="person-circle-outline" size={size ?? 24} color={color ?? 'black'} />
        ),
      }}
    />
  </Tab.Navigator>
);

const AppWrapper = () => {
  const { user } = useContext(AppContext);

  return (
    <NavigationContainer>
      {user ? (
        <MainTabs />
      ) : (
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};


export default function App() {
  return (
    <AppProvider>
      <AppWrapper />
    </AppProvider>
  );
}
