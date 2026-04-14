import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Auth } from 'aws-amplify';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { getUserById } from '../apis/userApi';
import { LoanRecord, getAllLoans } from '../apis/loanApi';
import AppText from '../components/AppText';
import {
  getActiveLoans,
  getBorrowedAmount,
  getNextEmiSummary,
  getRemainingBorrowLimit,
} from '../helpers/loan';
import { COLORS } from '../theme/colors';

const DashboardScreen = ({ navigation }: any) => {
  const [userName, setUserName] = useState('User');
  const [loanLimit, setLoanLimit] = useState(0);
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoadingLoans(true);
      setError('');
      const cognitoUser = await Auth.currentAuthenticatedUser();
      const cognitoSub = cognitoUser?.attributes?.sub as string;

      const [profile, loanResult] = await Promise.all([
        getUserById(cognitoSub),
        getAllLoans(),
      ]);

      setUserName(`${profile.firstName} ${profile.lastName}`.trim());
      setLoanLimit(profile.loanLimit || 0);
      setLoans(loanResult);
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

  const { borrowedAmount, remainingAmount, nextEmiAmount, nextEmiDate, activeLoanCount } =
    useMemo(() => {
      const borrowed = getBorrowedAmount(loans);
      const remaining = getRemainingBorrowLimit(loanLimit, loans);
      const emi = getNextEmiSummary(loans);
      const activeLoans = getActiveLoans(loans).length;

      return {
        borrowedAmount: borrowed,
        remainingAmount: remaining,
        nextEmiAmount: emi.totalEmi,
        nextEmiDate: emi.dueDateLabel,
        activeLoanCount: activeLoans,
      };
    }, [loanLimit, loans]);

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
          ₹ {loanLimit.toLocaleString()}
        </AppText>

        <View style={styles.mainBottom}>
          <View>
            <AppText style={styles.label}>Remaining Limit</AppText>
            <AppText style={styles.amountSmall}>
              ₹ {remainingAmount.toLocaleString()}
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
            ₹ {borrowedAmount.toLocaleString()}
          </AppText>
        </View>

        <View style={styles.smallCard}>
          <Ionicons name="calendar-outline" size={20} color="#EA580C" />
          <AppText style={styles.smallLabel}>Next EMI Due</AppText>
          <AppText style={styles.smallAmount}>
            ₹ {nextEmiAmount.toLocaleString()}
          </AppText>
          <AppText style={styles.subText}>{nextEmiDate}</AppText>
        </View>
      </View>

      {/* DUE CARD */}
      <View style={styles.dueCard}>
        <View>
          <AppText style={styles.dueTitle}>Upcoming EMI</AppText>
          <AppText style={styles.dueAmount}>₹ {nextEmiAmount.toLocaleString()}</AppText>
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
                  ₹ {loan.amount.toLocaleString()}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
  },

  subText: {
    color: '#777',
    fontSize: 12,
    marginTop: 2,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontWeight: '600',
  },

  mainCard: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },

  label: {
    color: '#ddd',
    fontSize: 12,
  },

  amount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },

  amountSmall: {
    color: '#fff',
    fontWeight: '600',
    marginTop: 2,
  },

  mainBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    alignItems: 'center',
  },

  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  applyText: {
    color: COLORS.primary,
    marginLeft: 4,
  },

  row: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'space-between',
  },

  smallCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  smallLabel: {
    fontSize: 12,
    color: '#777',
    marginTop: 6,
  },

  smallAmount: {
    fontWeight: '600',
    marginTop: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    alignItems: 'center',
  },

  sectionTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  dueCard: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueTitle: {
    color: COLORS.primary,
    fontSize: 13,
  },
  dueAmount: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 20,
    marginTop: 4,
  },
  dueSubText: {
    color: '#4B5563',
    marginTop: 2,
    fontSize: 12,
  },
  dueBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dueBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  link: {
    color: COLORS.primary,
  },

  empty: {
    marginTop: 20,
    alignItems: 'center',
  },

  loanCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  loanLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  loanRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  loanAmount: {
    fontWeight: '600',
  },
});