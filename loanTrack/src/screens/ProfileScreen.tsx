import { Ionicons } from '@expo/vector-icons';
import { Auth } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { getUserById } from '../apis/userApi';
import { UserRecord } from '../interfaces/index';
import AppText from '../components/AppText';
import { clearSessionToken } from '../services/session';
import { COLORS } from '../theme/colors';

const ProfileScreen = ({ navigation }: any) => {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [cognitoProfile, setCognitoProfile] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUser = async () => {
    try {
      setLoading(true);
      setError('');
      const cognitoUser = await Auth.currentAuthenticatedUser();
      const cognitoSub = cognitoUser?.attributes?.sub as string;
      setCognitoProfile({
        firstName: cognitoUser?.attributes?.given_name,
        lastName: cognitoUser?.attributes?.family_name,
        email: cognitoUser?.attributes?.email,
      });
      const profile = await getUserById(cognitoSub);
      setUser(profile);
    } catch (err) {
      setError(String(err));
      // keep Cognito profile as fallback even if backend call fails
      if (!cognitoProfile) {
        try {
          const cognitoUser = await Auth.currentAuthenticatedUser();
          setCognitoProfile({
            firstName: cognitoUser?.attributes?.given_name,
            lastName: cognitoUser?.attributes?.family_name,
            email: cognitoUser?.attributes?.email,
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
      await clearSessionToken();
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
      Alert.alert('Success', 'Logged out successfully.');
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },

  header: {
    alignItems: 'center',
    marginTop: 20,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },

  name: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },

  email: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 20,
    paddingVertical: 10,
  },

  cardTitle: {
    fontSize: 12,
    color: '#888',
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 0.5,
    borderColor: '#eee',
  },

  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },

  itemText: {
    marginLeft: 10,
    fontSize: 14,
  },

  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 10,
  },

  logoutText: {
    color: '#DC2626',
    marginLeft: 6,
    fontWeight: '600',
  },

  footer: {
    alignItems: 'center',
    marginTop: 20,
  },

  version: {
    fontSize: 12,
    color: '#999',
  },
  errorText: {
    marginTop: 6,
    color: '#DC2626',
    fontSize: 12,
    textAlign: 'center',
  },
});