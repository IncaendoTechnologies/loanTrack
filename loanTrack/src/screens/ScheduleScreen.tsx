import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { LoanRecord, getAllLoans } from '../apis/loanApi';
import AppText from '../components/AppText';
import { COLORS } from '../theme/colors';
import styles from '../stylesheets/ScheduleStyles';

const ScheduleScreen = ({ navigation }: any) => {
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadLoans = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      const response = await getAllLoans();
      setLoans(response);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadLoans();
    }, [])
  );

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <AppText style={styles.title}>Payment Schedule</AppText>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadLoans(true)} />
          }
        >
          {error ? (
            <View style={styles.center}>
              <AppText style={styles.errorText}>{error}</AppText>
            </View>
          ) : loans.length === 0 ? (
            <View style={styles.center}>
              <AppText>No loans found</AppText>
            </View>
          ) : (
            loans.map((item) => (
              <TouchableOpacity
                key={item.loanId}
                style={styles.row}
                onPress={() =>
                  navigation.navigate('EmiResult', {
                    loan: item,
                    isNew: false,
                  })
                }
              >
                <View>
                  <AppText style={styles.month}>#{item.loanId.slice(0, 8)}</AppText>
                  <AppText style={styles.subText}>{item.duration} months</AppText>
                </View>
                <View style={styles.right}>
                  <AppText style={styles.cell}>EMI ₹{item.emi.toLocaleString()}</AppText>
                  <AppText style={styles.subText}>
                    Amount ₹{item.amount.toLocaleString()}
                  </AppText>
                  <AppText style={[styles.subText, { color: '#16A34A' }]}>
                    {item.status}
                  </AppText>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default ScheduleScreen;

