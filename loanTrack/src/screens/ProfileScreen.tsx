import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Auth } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ToastAndroid,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import { createUser, getUserByIdOrNull } from '../apis/userApi';
import { UserPayload, UserRecord } from '../interfaces/index';
import AppText from '../components/AppText';
import type { CognitoUser } from '../types/types';
import { COLORS } from '../theme/colors';
import styles from '../stylesheets/ProfileStyles';

const ProfileScreen = ({ navigation }: any) => {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [cognitoProfile, setCognitoProfile] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const createBackendUser = async (cognitoUser: CognitoUser) => {
    const payload = {
      id: cognitoUser.attributes.sub,
      owner: cognitoUser.attributes.sub,
      email: cognitoUser.attributes.email,
      phoneNumber: cognitoUser.attributes.phone_number,
      firstName: cognitoUser.attributes.given_name,
      lastName: cognitoUser.attributes.family_name,
    };

    if (!payload.email || !payload.phoneNumber || !payload.firstName || !payload.lastName) {
      console.log('Cannot create backend user from Cognito: missing attributes', payload);
      return null;
    }

    try {
      return await createUser(payload as UserPayload);
    } catch (createError) {
      console.log('Failed to create backend user in ProfileScreen:', createError);
      return null;
    }
  };

  const loadUser = async () => {
    try {
      setLoading(true);
      setError('');
      const cognitoUser = (await Auth.currentAuthenticatedUser()) as CognitoUser;
      const cognitoSub = cognitoUser.attributes.sub;
      setCognitoProfile({
        firstName: cognitoUser.attributes.given_name,
        lastName: cognitoUser.attributes.family_name,
        email: cognitoUser.attributes.email,
      });

      let profile = await getUserByIdOrNull(cognitoSub);
      if (!profile) {
        profile = await createBackendUser(cognitoUser);
      }

      if (profile) {
        setUser(profile);
      }
    } catch (err) {
      setError(String(err));
      // keep Cognito profile as fallback even if backend call fails
      if (!cognitoProfile) {
        try {
          const cognitoUser = (await Auth.currentAuthenticatedUser()) as CognitoUser;
          setCognitoProfile({
            firstName: cognitoUser.attributes.given_name,
            lastName: cognitoUser.attributes.family_name,
            email: cognitoUser.attributes.email,
          });
        } catch {
          // ignore fallback error
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const logout = async () => {
    try {
      await Auth.signOut();
    } catch (error) {
      console.log('Cognito signOut error:', error);
    } finally {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
      ToastAndroid.show('Success: Logged out successfully.', ToastAndroid.SHORT);
    }
  };

  const renderItem = (icon: any, label: string, color: string, type: string, onPress?: () => void) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.itemLeft}>

        <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
          {type === 'AntDesign' ? (
            <AntDesign name={icon} size={18} color={color} />
          ) : (
            <Ionicons name={icon} size={18} color={color} />
          )}
        </View>
        <AppText style={styles.itemText}>{label}</AppText>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#999" />
    </TouchableOpacity>
  );

  const displayName =
    user
      ? `${user.firstName} ${user.lastName}`
      : [cognitoProfile?.firstName, cognitoProfile?.lastName].filter(Boolean).join(' ') ||
      'User';
  const displayEmail = user?.email || cognitoProfile?.email || '-';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <ScrollView style={styles.container}>
      <View >
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <AppText style={styles.avatarText}>{avatarLetter}</AppText>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 10 }} />
        ) : (
          <>
            <AppText style={styles.name}>
              {displayName}
            </AppText>

            <AppText style={styles.email}>
              {displayEmail}
            </AppText>
            {error ? <AppText style={styles.errorText}>{error}</AppText> : null}
          </>
        )}
      </View>

      {/* SETTINGS CARD */}
      <View style={styles.card}>
        <AppText style={styles.cardTitle}>
          Account Settings
        </AppText>

        {renderItem('shield-checkmark', 'Security & Privacy', '#7C3AED', "Ionicons")}
        {renderItem('history', 'Transaction History', '#2563EB', 'AntDesign', () => navigation.navigate('Transaction'))}
        {renderItem('receipt-outline', 'Your Loans', '#EA580C', "Ionicons", () => navigation.navigate('Schedule'))}
        {renderItem('settings', 'App Preferences', '#475569', "Ionicons")}
      </View>

      {/* LOGOUT BUTTON */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Ionicons name="log-out" size={18} color="#DC2626" />
        <AppText style={styles.logoutText}>Logout</AppText>
      </TouchableOpacity>

      {/* VERSION */}
      <View style={styles.footer}>
        <AppText style={styles.version}>
          LoanTrack v1.0.0
        </AppText>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
