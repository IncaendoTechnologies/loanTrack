import { Ionicons } from '@expo/vector-icons';
import { Auth } from 'aws-amplify';
import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  ToastAndroid,
} from 'react-native';

import { getWalletStatus, WalletStatus, transferToLoanLimit } from '../apis/walletApi';
import AppText from '../components/AppText';
import type { CognitoUser } from '../types/types';
import { COLORS } from '../theme/colors';
import styles from '../stylesheets/WalletStyles';
import { formatCurrencyIN } from '../utils/format';
import { useFocusEffect } from '@react-navigation/native';

const WalletScreen = ({ navigation }: any) => {
  const [wallet, setWallet] = useState<WalletStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  // Transfer Modal State
  const [transferVisible, setTransferVisible] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

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

  useFocusEffect(
    useCallback(() => {
      fetchWallet();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWallet();
  }, []);

  const formatCurrency = (amount: number) => {
    return '₹ ' + formatCurrencyIN(amount);
  };

  const handleTransfer = async () => {
    const numAmount = parseFloat(transferAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      ToastAndroid.show('Please enter a valid amount', ToastAndroid.SHORT);
      return;
    }

    if (!wallet || numAmount > wallet.walletBalance) {
      ToastAndroid.show('Amount exceeds wallet balance', ToastAndroid.SHORT);
      return;
    }

    if (numAmount > wallet.usedLoanAmount) {
      ToastAndroid.show('Cannot transfer more than used loan amount', ToastAndroid.SHORT);
      return;
    }

    setTransferLoading(true);
    try {
      const user = await Auth.currentAuthenticatedUser();
      const userId = user.attributes.sub;
      
      const response = await transferToLoanLimit({ userId, amount: numAmount });
      if (response.statusCode !== 200) {
        throw new Error(response.message || 'Transfer failed');
      }

      ToastAndroid.show(`Successfully transferred ₹${numAmount} to loan limit`, ToastAndroid.LONG);
      setTransferVisible(false);
      setTransferAmount('');
      fetchWallet(); // Refresh data
    } catch (err: any) {
      ToastAndroid.show(`Error: ${err.message}`, ToastAndroid.SHORT);
    } finally {
      setTransferLoading(false);
    }
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
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
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
          <TouchableOpacity style={styles.actionBtn} onPress={() => setTransferVisible(true)}>
            <Ionicons name="swap-horizontal-outline" size={24} color={COLORS.primary} />
            <AppText style={styles.actionText}>Transfer</AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Transfer Modal */}
      <Modal
        visible={transferVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setTransferVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: COLORS.card, width: '100%', borderRadius: 15, padding: 20, borderWidth: 1, borderColor: COLORS.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <AppText style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.text }}>Transfer to Loan Limit</AppText>
              <TouchableOpacity onPress={() => setTransferVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <AppText style={{ color: COLORS.subText, marginBottom: 10 }}>
              Amount to transfer from Wallet to repay Used Loan
            </AppText>
            
            <View style={{ backgroundColor: COLORS.background, padding: 10, borderRadius: 8, marginBottom: 15 }}>
              <AppText style={{ color: COLORS.subText, fontSize: 12 }}>Available Wallet Balance</AppText>
              <AppText style={{ color: COLORS.primary, fontSize: 16, fontWeight: 'bold' }}>
                ₹ {formatCurrencyIN(wallet?.walletBalance || 0)}
              </AppText>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 10, paddingHorizontal: 15, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border }}>
              <AppText style={{ fontSize: 20, color: COLORS.text, marginRight: 10 }}>₹</AppText>
              <TextInput
                style={{ flex: 1, height: 50, color: COLORS.text, fontSize: 18 }}
                placeholder="0"
                placeholderTextColor={COLORS.subText}
                keyboardType="numeric"
                value={transferAmount}
                onChangeText={setTransferAmount}
              />
            </View>

            <TouchableOpacity 
              style={{ backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: 10, alignItems: 'center', opacity: (!transferAmount || transferLoading) ? 0.7 : 1 }}
              onPress={handleTransfer}
              disabled={!transferAmount || transferLoading}
            >
              {transferLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <AppText style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Submit Transfer</AppText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default WalletScreen;
