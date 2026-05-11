import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from '../components/AppText';
import { COLORS } from '../theme/colors';
import { Auth } from 'aws-amplify';
import { getWalletStatus, topUpWallet } from '../apis/walletApi';
import styles from '../stylesheets/AddMoneyStyles';
import { formatCurrencyIN } from '../utils/format';

const AddMoneyScreen = ({ navigation }: any) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableCredit, setAvailableCredit] = useState(0);
  const [fetchingLimit, setFetchingLimit] = useState(true);

  useEffect(() => {
    fetchLimit();
  }, []);

  const fetchLimit = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const userId = user.attributes.sub;

      const data = await getWalletStatus(userId);
      setAvailableCredit(data.availableCredit || 0);
    } catch (err) {
      console.error('Error fetching limit:', err);
    } finally {
      setFetchingLimit(false);
    }
  };

  const handleAddMoney = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      ToastAndroid.show('Error: Please enter a valid amount', ToastAndroid.SHORT);
      return;
    }

    if (numAmount > availableCredit) {
      ToastAndroid.show('Error: Amount exceeds your available loan limit', ToastAndroid.SHORT);
      return;
    }

    setLoading(true);
    try {
      const session = await Auth.currentSession();
      const token = session.getAccessToken().getJwtToken();
      const user = await Auth.currentAuthenticatedUser();
      const userId = user.attributes.sub;
      const response = await topUpWallet({ userId, amount: numAmount });
      if ( response.statusCode !== 200 ) {
        throw new Error(response.message || 'Failed to add money');
      }

      ToastAndroid.show(`Success: ₹${numAmount} added to your wallet!`, ToastAndroid.LONG);
      navigation.goBack();
    } catch (err: any) {
      ToastAndroid.show(`Error: ${err.message}`, ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Add Money </AppText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.limitCard}>
          <AppText style={styles.limitLabel}>Available Loan Limit</AppText>
          {fetchingLimit ? (
            <ActivityIndicator color={COLORS.primary} size="small" />
          ) : (
            <AppText style={styles.limitValue}>₹{formatCurrencyIN(availableCredit)}</AppText>
          )}
        </View>

        <View style={styles.inputContainer}>
          <AppText style={styles.label}>Enter Amount</AppText>
          <View style={styles.amountInputRow}>
            <AppText style={styles.currencySymbol}>₹</AppText>
            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
          </View>
          <View style={styles.divider} />
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.subText} />
          <AppText style={styles.infoText}>
            Money will be transferred from your loan limit to your wallet instantly.
          </AppText>
        </View>

        <TouchableOpacity
          style={[styles.button, (!amount || loading) && styles.buttonDisabled]}
          onPress={handleAddMoney}
          disabled={!amount || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <AppText style={styles.buttonText}>Transfer to Wallet</AppText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddMoneyScreen;
