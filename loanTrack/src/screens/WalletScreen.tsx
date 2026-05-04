import { Ionicons } from '@expo/vector-icons';
import { Auth } from 'aws-amplify';
import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';

import { getWalletStatus, WalletStatus } from '../apis/walletApi';
import AppText from '../components/AppText';
import type { CognitoUser } from '../types/types';
import { COLORS } from '../theme/colors';
import styles from '../stylesheets/WalletStyles';

const WalletScreen = ({ navigation }: any) => {
  const [wallet, setWallet] = useState<WalletStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchWallet = async () => {
    try {
      setError('');
      const cognitoUser = (await Auth.currentAuthenticatedUser()) as CognitoUser;
      const cognitoSub = cognitoUser.attributes.sub;

      const walletData = await getWalletStatus(cognitoSub);
      setWallet(walletData);
    } catch (err) {
      setError(String(err));
      console.log('Error fetching wallet:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWallet();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>My Wallet</AppText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {error ? <AppText style={styles.errorText}>{error}</AppText> : null}

        {/* Main Balance Card */}
        <View style={styles.balanceCard}>
          <AppText style={styles.balanceLabel}>Available Wallet Balance</AppText>
          <AppText style={styles.balanceValue}>
            {formatCurrency(wallet?.walletBalance || 0)}
          </AppText>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <AppText style={styles.statLabel}>Total Loan Limit</AppText>
            <AppText style={styles.statValue}>
              {formatCurrency(wallet?.loanLimit || 0)}
            </AppText>
          </View>

          <View style={styles.statCard}>
            <AppText style={styles.statLabel}>Available Credit</AppText>
            <AppText style={styles.statValue}>
              {formatCurrency(wallet?.availableCredit || 0)}
            </AppText>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <AppText style={styles.statLabel}>Used Loan Amount</AppText>
            <AppText style={styles.statValue}>
              {formatCurrency(wallet?.usedLoanAmount || 0)}
            </AppText>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => navigation.navigate('AddMoney')}
          >
            <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
            <AppText style={styles.actionText}>Add Money</AppText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="swap-horizontal-outline" size={24} color={COLORS.primary} />
            <AppText style={styles.actionText}>Transfer</AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default WalletScreen;
