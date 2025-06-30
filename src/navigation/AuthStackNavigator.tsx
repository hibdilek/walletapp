import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../components/LoginScreen';
import RegisterScreen from '../components/RegisterScreen';
import MainTabs from '../components/MainTabs';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main : undefined ; 
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AuthStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Main" component={MainTabs} />  
    </Stack.Navigator>
  );
};

export default AuthStackNavigator;
