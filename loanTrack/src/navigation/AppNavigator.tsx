import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../interfaces';

import React from 'react';

import ConfirmSignUpScreen from '../screens/ConfirmSignUpScreen';
import EmiResultScreen from '../screens/EmiResultScreen';
import PaymentScheduleScreen from '../screens/PaymentScheduleScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import MainTabNavigator from './MainTabNavigator';
import { AppStackRoute } from '../enums';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={AppStackRoute.SignIn} component={SignInScreen} />
      <Stack.Screen name={AppStackRoute.SignUp} component={SignUpScreen} />
      <Stack.Screen name={AppStackRoute.ConfirmSignUp} component={ConfirmSignUpScreen} />
      <Stack.Screen name={AppStackRoute.MainTabs} component={MainTabNavigator} />
      <Stack.Screen name={AppStackRoute.EmiResult} component={EmiResultScreen} />
      <Stack.Screen name={AppStackRoute.PaymentSchedule} component={PaymentScheduleScreen} />

    </Stack.Navigator>
  );
};

export default AppNavigator;