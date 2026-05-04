import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../interfaces';

import React from 'react';

import EmiResultScreen from '../screens/EmiResultScreen';
import PaymentScheduleScreen from '../screens/PaymentScheduleScreen';
import ConfirmPaymentScreen from '../screens/ConfirmPaymentScreen';
import AddMoneyScreen from '../screens/AddMoneyScreen';
import MainTabNavigator from './MainTabNavigator';
import AuthNavigator from './AuthNavigator';
import { AppStackRoute } from '../enums';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={AppStackRoute.Auth} component={AuthNavigator} />
      <Stack.Screen name={AppStackRoute.MainTabs} component={MainTabNavigator} />
      <Stack.Screen name={AppStackRoute.EmiResult} component={EmiResultScreen} />
      <Stack.Screen name={AppStackRoute.PaymentSchedule} component={PaymentScheduleScreen} />
      <Stack.Screen name={AppStackRoute.ConfirmPayment} component={ConfirmPaymentScreen} />
      <Stack.Screen name={AppStackRoute.AddMoney} component={AddMoneyScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;