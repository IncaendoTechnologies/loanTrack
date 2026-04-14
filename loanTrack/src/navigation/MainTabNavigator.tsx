import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import ApplyLoanScreen from '../screens/ApplyLoanScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
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
        tabBarStyle: { backgroundColor: COLORS.card },

        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === AppTabRoute.Home) iconName = 'home';
          else if (route.name === AppTabRoute.Apply) iconName = 'cash';
          else if (route.name === AppTabRoute.Schedule) iconName = 'calendar';
          else if (route.name === AppTabRoute.Profile) iconName = 'person';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name={AppTabRoute.Home} component={DashboardScreen} />
      <Tab.Screen name={AppTabRoute.Apply} component={ApplyLoanScreen} />
      <Tab.Screen name={AppTabRoute.Schedule} component={ScheduleScreen} />
      <Tab.Screen name={AppTabRoute.Profile} component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;