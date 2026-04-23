import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import ConfirmSignUpScreen from '../screens/ConfirmSignUpScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import { AppStackRoute } from '../enums';
import { AuthStackParamList } from '../interfaces';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={AppStackRoute.SignIn} component={SignInScreen} />
      <Stack.Screen name={AppStackRoute.SignUp} component={SignUpScreen} />
      <Stack.Screen name={AppStackRoute.ConfirmSignUp} component={ConfirmSignUpScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;