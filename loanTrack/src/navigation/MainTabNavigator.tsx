import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import ApplyLoanScreen from '../screens/ApplyLoanScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WalletScreen from '../screens/WalletScreen';
import { COLORS } from '../theme/colors';
import { AppTabRoute } from '../enums';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.subText,
        tabBarStyle: { backgroundColor: COLORS.card, paddingTop: 10, height: 60, paddingBottom: 10 },

        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === AppTabRoute.Home) iconName = 'home';
          else if (route.name === AppTabRoute.Apply) iconName = 'cash';
          else if (route.name === AppTabRoute.Profile) iconName = 'person';
          else if (route.name === AppTabRoute.Wallet) iconName = 'wallet';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name={AppTabRoute.Home} component={DashboardScreen} />
      <Tab.Screen name={AppTabRoute.Wallet} component={WalletScreen} />
      <Tab.Screen name={AppTabRoute.Apply} component={ApplyLoanScreen} />
      <Tab.Screen name={AppTabRoute.Profile} component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;