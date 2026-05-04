import { Ionicons } from '@expo/vector-icons';
import { Auth } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ToastAndroid,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native';

import { createUser, getUserById, getUserByIdOrNull } from '../apis/userApi';
import { UserRecord } from '../interfaces/index';
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
      return await createUser(payload);
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

  const renderItem = (icon: any, label: string, color: string) => (
    <TouchableOpacity style={styles.item}>
      <View style={styles.itemLeft}>
        <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={18} color={color} />
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

        {renderItem('mail', 'Email Notifications', '#2563EB')}
        {renderItem('shield-checkmark', 'Security & Privacy', '#7C3AED')}
        {renderItem('notifications', 'Push Notifications', '#EA580C')}
        {renderItem('settings', 'App Preferences', '#475569')}
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
