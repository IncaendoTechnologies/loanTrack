import { Ionicons, AntDesign } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Auth } from 'aws-amplify';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
  ToastAndroid
} from 'react-native';

import { getUserById } from '../apis/userApi';
import { LoanRecord, getAllLoans } from '../apis/loanApi';
import AppText from '../components/AppText';
import type { CognitoUser } from '../types/types';
import {
  getActiveLoans,
  getBorrowedAmount,
  getNextEmiSummary,
} from '../helpers/loan';
import { getWalletStatus } from '../apis/walletApi';
import { COLORS } from '../theme/colors';
import styles from '../stylesheets/DashboardStyles';
import { formatCurrencyIN } from '../utils/format';

const DashboardScreen = ({ navigation }: any) => {
  const [userName, setUserName] = useState('User');
  const [loanLimit, setLoanLimit] = useState(0);
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [loadingLoans, setLoadingLoans] = useState(true);
  const [usedLoanAmount, setUsedLoanAmount] = useState(0);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoadingLoans(true);
      setError('');
      const cognitoUser = (await Auth.currentAuthenticatedUser()) as CognitoUser;
      const cognitoSub = cognitoUser.attributes.sub;

      const [profile, loanResult, walletStatus] = await Promise.all([
        getUserById(cognitoSub),
        getAllLoans(),
        getWalletStatus(cognitoSub),
      ]);

      setUsedLoanAmount(walletStatus.usedLoanAmount);
      setUserName(`${profile.firstName} ${profile.lastName}`.trim());
      setLoanLimit(profile.loanLimit || 0);
      setLoans(loanResult);
      setRemainingAmount(walletStatus.availableCredit || 0);
    } catch (err) {
      setError(String(err));
      setLoans([]);
    } finally {
      setLoadingLoans(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  const { borrowedAmount, nextEmiAmount, nextEmiDate, activeLoanCount } =
    useMemo(() => {
      const borrowed = getBorrowedAmount(loans);
      const emi = getNextEmiSummary(loans);
      const activeLoans = getActiveLoans(loans).length;

      return {
        borrowedAmount: borrowed,
        nextEmiAmount: emi.totalEmi,
        nextEmiDate: emi.dueDateLabel,
        activeLoanCount: activeLoans,
      };
    }, [loans]);

  const recentLoans = useMemo(() => {
    return [...loans]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [loans]);

  const userInitial = userName?.[0]?.toUpperCase() || 'U';

  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <AppText style={styles.title}>
            Hello, {userName}
          </AppText>
          <AppText style={styles.subText}>
            Welcome back
          </AppText>
        </View>

        <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
          <AppText style={styles.avatarText}>
            {userInitial}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* MAIN CARD */}
      <View style={styles.mainCard}>
        <View style={styles.mainBottom}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <AppText style={styles.label}>Borrow Limit</AppText>

            <AppText style={styles.amount} numberOfLines={1} adjustsFontSizeToFit>
              ₹ {formatCurrencyIN(loanLimit)}
            </AppText>
          </View>

          <TouchableOpacity
            style={styles.applyBtn}

            onPress={() => navigation.navigate('Apply')}
          >
            <Ionicons name="add" size={16} color={COLORS.primary} />
            <AppText style={styles.applyText}>Apply</AppText>
          </TouchableOpacity>

        </View>
        <View style={styles.mainWallet}>
          <View style={{ flex: 1 }}>
            <AppText style={styles.label}>Remaining Limit</AppText>
            <AppText style={styles.amountSmall} numberOfLines={1} adjustsFontSizeToFit>
              ₹ {formatCurrencyIN(remainingAmount)}
            </AppText>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <AppText style={styles.label}>Used by wallet</AppText>
            <AppText style={styles.amountSmall} numberOfLines={1} adjustsFontSizeToFit>
              ₹ {formatCurrencyIN(usedLoanAmount)}
            </AppText>
          </View>
        </View>
      </View>

      {/* INFO CARDS */}
      {/* <View style={styles.row}>
        <View style={styles.paymentCard}>
          <View style={styles.paymentCardIcon}>
            <Ionicons name="wallet-outline" size={24} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <AppText style={styles.paymentCardSub}>Borrowed Loan</AppText>
            <AppText style={styles.paymentCardTitle}>₹ {formatCurrencyIN(borrowedAmount)}</AppText>
          </View>
        </View>

        <View style={styles.paymentCard}>
          <View style={[styles.paymentCardIcon, { backgroundColor: '#FFF7ED' }]}>
            <Ionicons name="calendar-outline" size={24} color="#EA580C" />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <AppText style={styles.paymentCardSub}>Next EMI Due</AppText>
            <AppText style={styles.paymentCardTitle}>₹ {formatCurrencyIN(nextEmiAmount)}</AppText>
            {nextEmiDate !== '-' && <AppText style={{ fontSize: 10, color: '#777', marginTop: 2 }}>{nextEmiDate}</AppText>}
          </View>
        </View>
      </View> */}

      {/* DUE CARD */}
      <View style={[styles.dueCard, styles.borderColorLeft]}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <AppText style={styles.dueTitle}>Upcoming EMI</AppText>
          <AppText style={styles.dueAmount} numberOfLines={1} adjustsFontSizeToFit>₹ {formatCurrencyIN(nextEmiAmount)}</AppText>
          <AppText style={styles.dueSubText}>Due on {nextEmiDate}</AppText>
        </View>
        <View style={styles.dueBadge}>
          <AppText style={styles.dueBadgeText}>{activeLoanCount} Active</AppText>
        </View>
      </View>

      {/* RECENT LOANS */}
      <View style={styles.sectionHeader}>
        <AppText style={styles.sectionTitle}>
          Quick Actions
        </AppText>
      </View>

      {/* Payment CARDS */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.paymentCard, styles.borderColorLeft]}
          onPress={() => ToastAndroid.show('Feature coming soon ...', ToastAndroid.SHORT)}
        >
          <View style={styles.paymentCardIcon}>
            <Ionicons name="wallet-outline" size={24} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <AppText style={styles.paymentCardTitle}>Pay UPI</AppText>
            <AppText style={styles.paymentCardSub}>Transfer money</AppText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.paymentCard, styles.borderColorLeft]}
          onPress={() => navigation.navigate('Transaction')}
        >
          <View style={styles.paymentCardIcon}>
            <AntDesign name="history" size={24} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <AppText style={styles.paymentCardTitle}>History</AppText>
            <AppText style={styles.paymentCardSub}>View Transaction</AppText>
          </View>
        </TouchableOpacity>
      </View>



      {/* RECENT LOANS */}
      <View style={styles.sectionHeader}>
        <AppText style={styles.sectionTitle}>
          Recent Loans
        </AppText>

        <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
          <AppText style={styles.link} >
            View All
          </AppText>
        </TouchableOpacity>
      </View>
      <View style={{ marginBottom: 30 }}>
        {loadingLoans ? (
          <View style={styles.empty}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : error ? (
          <View style={styles.empty}>
            <AppText>Something went wrong</AppText>
          </View>
        ) : recentLoans.length === 0 ? (
          <View style={styles.empty}>
            <AppText>No loans found</AppText>
          </View>
        ) : (
          recentLoans.map((loan) => (
            <TouchableOpacity
              key={loan.loanId}
              style={[styles.loanCard, styles.borderColorLeft]}
              onPress={() =>
                navigation.navigate('EmiResult', {
                  loan,
                  isNew: false,
                })
              }
            >
              <View style={[styles.loanLeft, { flex: 1, marginRight: 10 }]}>
                <Ionicons name="wallet" size={20} color={COLORS.primary} />

                <View style={{ marginLeft: 10, flex: 1 }}>
                  <AppText style={styles.loanAmount} numberOfLines={1} adjustsFontSizeToFit>
                    ₹ {formatCurrencyIN(loan.amount)}
                  </AppText>
                  <AppText style={styles.subText}>
                    {new Date(loan.createdAt).toLocaleDateString('en-IN')}
                  </AppText>
                </View>
              </View>

              <View style={styles.loanRight}>
                <AppText style={styles.subText}>
                  {loan.duration} Months
                </AppText>
                <Ionicons name="chevron-forward" size={16} color="#999" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default DashboardScreen;

