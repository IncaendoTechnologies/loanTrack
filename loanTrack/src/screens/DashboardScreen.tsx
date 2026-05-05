import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Auth } from 'aws-amplify';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    View,
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
        <AppText style={styles.label}>Borrow Limit</AppText>

        <AppText style={styles.amount}>
          ₹ {formatCurrencyIN(loanLimit)}
        </AppText>

        <View style={styles.mainBottom}>
          <View>
            <AppText style={styles.label}>Remaining Limit</AppText>
            <AppText style={styles.amountSmall}>
              ₹ {formatCurrencyIN(remainingAmount)}
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
      </View>

      {/* INFO CARDS */}
      <View style={styles.row}>
        <View style={styles.smallCard}>
          <Ionicons name="wallet-outline" size={20} color={COLORS.primary} />
          <AppText style={styles.smallLabel}>Borrowed</AppText>
          <AppText style={styles.smallAmount}>
            ₹ {formatCurrencyIN(borrowedAmount)}
          </AppText>
        </View>

        <View style={styles.smallCard}>
          <Ionicons name="calendar-outline" size={20} color="#EA580C" />
          <AppText style={styles.smallLabel}>Next EMI Due</AppText>
          <AppText style={styles.smallAmount}>
            ₹ {formatCurrencyIN(nextEmiAmount)}
          </AppText>
          <AppText style={styles.subText}>{nextEmiDate}</AppText>
        </View>
      </View>

      {/* DUE CARD */}
      <View style={styles.dueCard}>
        <View>
          <AppText style={styles.dueTitle}>Upcoming EMI</AppText>
          <AppText style={styles.dueAmount}>₹ {formatCurrencyIN(nextEmiAmount)}</AppText>
          <AppText style={styles.dueSubText}>Due on {nextEmiDate}</AppText>
        </View>
        <View style={styles.dueBadge}>
          <AppText style={styles.dueBadgeText}>{activeLoanCount} Active</AppText>
        </View>
      </View>

      {/* RECENT LOANS */}
      <View style={styles.sectionHeader}>
        <AppText style={styles.sectionTitle}>
          Recent Loans
        </AppText>

        <TouchableOpacity>
          <AppText style={styles.link}>View All</AppText>
        </TouchableOpacity>
      </View>

      {loadingLoans ? (
        <View style={styles.empty}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.empty}>
          <AppText>{error}</AppText>
        </View>
      ) : recentLoans.length === 0 ? (
        <View style={styles.empty}>
          <AppText>No loans found</AppText>
        </View>
      ) : (
        recentLoans.map((loan) => (
          <TouchableOpacity
            key={loan.loanId}
            style={styles.loanCard}
            onPress={() =>
              navigation.navigate('EmiResult', {
                loan,
                isNew: false,
              })
            }
          >
            <View style={styles.loanLeft}>
              <Ionicons name="wallet" size={20} color={COLORS.primary} />

              <View style={{ marginLeft: 10 }}>
                <AppText style={styles.loanAmount}>
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
    </ScrollView>
  );
};

export default DashboardScreen;

