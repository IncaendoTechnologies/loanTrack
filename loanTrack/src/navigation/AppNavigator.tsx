import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../interfaces';

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Auth } from 'aws-amplify';

import EmiResultScreen from '../screens/EmiResultScreen';
import PaymentScheduleScreen from '../screens/PaymentScheduleScreen';
import ConfirmPaymentScreen from '../screens/ConfirmPaymentScreen';
import AddMoneyScreen from '../screens/AddMoneyScreen';
import MainTabNavigator from './MainTabNavigator';
import AuthNavigator from './AuthNavigator';
import { AppStackRoute } from '../enums';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<AppStackRoute>(AppStackRoute.Auth);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await Auth.currentAuthenticatedUser();
        setInitialRoute(AppStackRoute.MainTabs);
      } catch (error) {
        setInitialRoute(AppStackRoute.Auth);
      } finally {
        setIsReady(true);
      }
    };
    checkAuth();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
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