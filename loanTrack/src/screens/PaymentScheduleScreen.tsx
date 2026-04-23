import React from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AppText from '../components/AppText';
import { COLORS } from '../theme/colors';
import styles from '../stylesheets/PaymentScheduleStyles';

const PaymentScheduleScreen = ({ route, navigation }: any) => {
  const { loan } = route.params || {};

  if (!loan) {
    return (
      <View style={styles.container}>
        <AppText>No loan data found</AppText>
      </View>
    );
  }

  // Generate schedule
  const schedule = [];
  let remainingBalance = loan.amount;
  const monthlyRate = loan.interestRate / 12 / 100;

  for (let i = 1; i <= loan.duration; i++) {
    const interest = remainingBalance * monthlyRate;
    const principal = loan.emi - interest;
    remainingBalance -= principal;

    schedule.push({
      month: i,
      principal: Math.round(principal),
      interest: Math.round(interest),
      balance: Math.max(0, Math.round(remainingBalance)),
    });
  }

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
        </TouchableOpacity>

        <AppText style={styles.title}>Payment Schedule</AppText>

        <TouchableOpacity>
          <Ionicons name="download-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* SUMMARY */}
      <View style={styles.summary}>
        <View>
          <AppText style={styles.label}>Total Payment</AppText>
          <AppText style={styles.value}>
            ₹{loan.totalPayment.toLocaleString()}
          </AppText>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <AppText style={styles.label}>EMI</AppText>
          <AppText style={styles.value}>
            ₹{loan.emi.toLocaleString()}
          </AppText>
        </View>
      </View>

      {/* HEADER ROW */}
      <View style={styles.tableHeader}>
        <AppText style={styles.headerText}>Month</AppText>
        <AppText style={styles.headerText}>Principal</AppText>
        <AppText style={styles.headerText}>Interest</AppText>
        <AppText style={[styles.headerText, { textAlign: 'right' }]}>
          Balance
        </AppText>
      </View>

      {/* LIST */}
      <FlatList
        data={schedule}
        keyExtractor={(item) => item.month.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <AppText style={styles.month}>#{item.month}</AppText>

            <AppText style={styles.text}>
              ₹{item.principal.toLocaleString()}
            </AppText>

            <AppText style={[styles.text, { color: '#666' }]}>
              ₹{item.interest.toLocaleString()}
            </AppText>

            <AppText style={styles.balance}>
              ₹{item.balance.toLocaleString()}
            </AppText>
          </View>
        )}
      />
    </View>
  );
};

export default PaymentScheduleScreen;
