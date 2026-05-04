import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { Amplify } from 'aws-amplify';
import amplifyConfig from '../aws-exports';

import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import AppNavigator from './navigation/AppNavigator';
import { AppStackRoute } from './enums/navigation';

Amplify.configure(amplifyConfig);

export default function App() {
  const [loaded] = useFonts({
    PoppinsRegular: require('./assets/fonts/Poppins-Regular.ttf'),
    PoppinsMedium: require('./assets/fonts/Poppins-Medium.ttf'),
    PoppinsBold: require('./assets/fonts/Poppins-Bold.ttf'),
  });

  const linking = {
    prefixes: ['loantrack://'],
    config: {
      screens: {
        [AppStackRoute.ConfirmPayment]: 'confirm-payment',
        [AppStackRoute.Auth]: {
          path: 'auth',
          screens: {
            [AppStackRoute.SignIn]: 'signin',
            [AppStackRoute.SignUp]: 'signup'
          }
        }
      },
    },
  };


  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <NavigationContainer linking={linking}>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}