import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ScrollView,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import AppText from '../components/AppText';
import styles from '../stylesheets/ApplyLoanStyles';
import { Auth } from 'aws-amplify';
import { formatCurrencyIN } from '../utils/format';
import { COLORS } from '../theme/colors';

const ApplyLoanScreen = ({ navigation }: any) => {
  const [amount, setAmount] = useState('');
  const [interest, setInterest] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [availableCredit, setAvailableCredit] = useState(0);
  const [fetchingWallet, setFetchingWallet] = useState(true);

  React.useEffect(() => {
    const fetchWallet = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        const userId = user.attributes.sub;
        const { getWalletStatus } = await import('../apis/walletApi');
        const data = await getWalletStatus(userId);
        setAvailableCredit(data.availableCredit || 0);
      } catch (err) {
        console.error('Error fetching wallet:', err);
      } finally {
        setFetchingWallet(false);
      }
    };
    fetchWallet();
  }, []);

  const calculateEMI = async () => {
    setErrorMessage('');
    const p = parseFloat(amount);
    const r = parseFloat(interest) / 12 / 100;
    const n = parseFloat(duration);

    if (!p || !r || !n) {
      const message = 'Please enter valid amount, interest rate, and duration.';
      setErrorMessage(message);
      return;
    }

    if (p > availableCredit) {
      setErrorMessage(`Amount exceeds your available credit limit of ₹${formatCurrencyIN(availableCredit)}`);
      return;
    }

    try {
      setLoading(true);
      const emi =
        (p * r * Math.pow(1 + r, n)) /
        (Math.pow(1 + r, n) - 1);

      const totalPayment = emi * n;
      const totalInterest = totalPayment - p;

      const loanData = {
        amount: p,
        interestRate: parseFloat(interest),
        duration: n,
        emi: Math.round(emi),
        totalInterest: Math.round(totalInterest),
        totalPayment: Math.round(totalPayment),
      };

      navigation.navigate('EmiResult', {
        loan: loanData,
        isNew: true,
      });
    } catch (error) {
      const message = (error as any)?.message || 'Unable to calculate loan. Please try again.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Apply Loan</AppText>
        <View style={{ width: 24 }} />
      </View>

      {/* FORM CARD */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <AppText style={styles.cardTitle}>Loan Details</AppText>
          <View style={{ backgroundColor: COLORS.card, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border }}>
             <AppText style={{ color: COLORS.primary, fontSize: 12, fontWeight: 'bold' }}>
               Limit: ₹{formatCurrencyIN(availableCredit)}
             </AppText>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Loan Amount (₹)</AppText>
          <TextInput
            style={styles.input}
            placeholder="e.g. 100000"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Interest */}
        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Interest Rate (%)</AppText>
          <TextInput
            style={styles.input}
            placeholder="e.g. 10.5"
            keyboardType="numeric"
            value={interest}
            onChangeText={setInterest}
          />
        </View>

        {/* Duration */}
        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Loan Duration (Months)</AppText>
          <TextInput
            style={styles.input}
            placeholder="e.g. 12"
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
          />
        </View>

        {/* BUTTON */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={calculateEMI}
          disabled={loading}
        >
          <Ionicons name="calculator" size={18} color="#fff" />
          <AppText style={styles.buttonText}>{loading ? 'Calculating...' : 'Calculate EMI'}</AppText>
        </TouchableOpacity>

        {errorMessage ? <AppText style={styles.errorText}>{errorMessage}</AppText> : null}
      </View>

      {/* NOTE */}
      <View style={styles.noteBox}>
        <AppText style={styles.noteText}>
          <AppText style={{ fontWeight: 'bold' }}>Note: </AppText>
          This is a simulation. Actual loan terms may vary based on credit score and bank policies.
        </AppText>
      </View>
    </ScrollView>
  );
};

export default ApplyLoanScreen;

