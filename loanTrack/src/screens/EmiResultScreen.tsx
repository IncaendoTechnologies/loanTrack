import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Auth } from 'aws-amplify';
import {
    ToastAndroid,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native';

import { createLoan } from '../apis/loanApi';
import AppText from '../components/AppText';
import type { CognitoUser } from '../types/types';
import { COLORS } from '../theme/colors';
import styles from '../stylesheets/EmiResult';

const EmiResultScreen = ({ route, navigation }: any) => {
  const { loan, isNew } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!loan) {
    return (
      <View style={styles.container}>
        <AppText>No loan data found</AppText>
      </View>
    );
  }

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      if (isNew) {
        const user = (await Auth.currentAuthenticatedUser()) as CognitoUser;
        const userId = user.attributes.sub;

        await createLoan({
          userId,
          amount: loan.amount,
          interestRate: loan.interestRate,
          duration: loan.duration,
        });
      }

      navigation.navigate('MainTabs', {
        screen: 'Home',
      });
    } catch (error) {
      console.log('Create Loan Error:', error);
      const message = 'Unable to save loan. Please try again.';
      setErrorMessage(message);
      ToastAndroid.show(`Error: ${message}`, ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
        </TouchableOpacity>

        <AppText style={styles.title}>EMI Result</AppText>

        <TouchableOpacity>
          <Ionicons name="share-social-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* EMI RESULT */}
      <View style={styles.centerBox}>
        <AppText style={styles.label}>Monthly EMI</AppText>

        <AppText style={styles.emi}>
          ₹{loan.emi.toLocaleString()}
        </AppText>

        <View style={styles.successBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
          <AppText style={styles.successText}>
            Calculated Successfully
          </AppText>
        </View>
      </View>

      {/* SUMMARY CARD */}
      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Loan Summary</AppText>

        {renderRow('Loan Amount', `₹${loan.amount.toLocaleString()}`)}
        {renderRow('Interest Rate', `${loan.interestRate}%`)}
        {renderRow('Duration', `${loan.duration} Months`)}
        {renderRow('Total Interest', `₹${loan.totalInterest.toLocaleString()}`, true)}
        {renderRow('Total Payment', `₹${loan.totalPayment.toLocaleString()}`, true, true)}
      </View>

      {/* ACTION BUTTONS */}
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={() =>
            navigation.navigate('PaymentSchedule', { loan })
          }
        >
          <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
          <AppText style={styles.outlineText}>Schedule</AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryBtn, loading && styles.buttonDisabled]}
          onPress={handleConfirm}
          disabled={loading}
        >
          <AppText style={styles.primaryText}>
            {loading ? (isNew ? 'Saving...' : 'Please wait...') : isNew ? 'Confirm Loan' : 'Back Home'}
          </AppText>
        </TouchableOpacity>
      </View>
      {errorMessage ? (
        <View style={styles.errorContainer}>
          <AppText style={styles.errorText}>{errorMessage}</AppText>
        </View>
      ) : null}
    </ScrollView>
  );
};

export default EmiResultScreen;

/* Helper Row */
const renderRow = (label: string, value: string, highlight = false, primary = false) => (
  <View
    style={[
      styles.rowItem,
      highlight && { backgroundColor: '#F8FAFC' },
      primary && { backgroundColor: '#EEF2FF' },
    ]}
  >
    <AppText style={{ color: '#666' }}>{label}</AppText>
    <AppText
      style={{
        fontWeight: '600',
        color: primary ? COLORS.primary : '#000',
      }}
    >
      {value}
    </AppText>
  </View>
);

