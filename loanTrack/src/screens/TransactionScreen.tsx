import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState, useEffect } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import AppText from '../components/AppText';
import { COLORS } from '../theme/colors';
import { getTransactions, ApiTransaction } from '../apis/transactionApi';

const STATUS_FILTERS = ['All', 'PAYMENT', 'DISBURSEMENT', 'WALLET_TRANSFER'] as const;

const STATUS_CONFIG: Record<string, { color: string, bg: string, icon: string }> = {
  PAYMENT: { color: '#16A34A', bg: '#F0FDF4', icon: 'checkmark-circle' },
  DISBURSEMENT: { color: '#D97706', bg: '#FFFBEB', icon: 'time-outline' },
  WALLET_TRANSFER: { color: '#2563EB', bg: '#EFF6FF', icon: 'swap-horizontal' },
  DEFAULT: { color: '#475569', bg: '#F1F5F9', icon: 'list' }
};

const TransactionScreen = ({ navigation }: any) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<ApiTransaction[]>([]);
  const [error, setError] = useState('');

  const [status, setStatus] = useState<typeof STATUS_FILTERS[number]>('All');

  const [statusOpen, setStatusOpen] = useState(false);

  const fetchHistory = async () => {
    try {
      setError('');
      const data = await getTransactions();
      setPayments(data || []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const filtered = useMemo(() => {
    return payments
      .filter(p => {
        const statusMatch = status === 'All' || p.type === status;
        return statusMatch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [payments, status]);

  const grouped = useMemo(() => {
    const map: Record<string, ApiTransaction[]> = {};
    filtered.forEach(p => {
      const monthYear = new Date(p.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!map[monthYear]) map[monthYear] = [];
      map[monthYear].push(p);
    });
    return map;
  }, [filtered]);

  const renderCard = (item: ApiTransaction) => {
    const isDebit = item.amount < 0;
    const isFailed = item.status === 'FAILED';
    const amountColor = isFailed ? '#DC2626' : isDebit ? '#DC2626' : '#179b00ff';

    return (
      <View key={item.transactionId} style={styles.card}>
        <View style={{ flex: 1 }}>
          <AppText style={styles.titleText}>{item.note || item.type}</AppText>
          <AppText style={styles.subText}>{item.transactionId}</AppText>
          <AppText style={styles.subText}>
            {new Date(item.date).toDateString()}
          </AppText>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <AppText style={[styles.amount, { color: amountColor }]}>
            {isDebit ? '-' : '+'}{' '}₹{Math.abs(item.amount).toLocaleString()}
          </AppText>
          {item.status && (
            <AppText style={{ color: amountColor, fontSize: 12 }}>
              {item.status === "SUCCESS" ? isDebit ? "Debited" : "Credited" : item.status === "FAILED" ? "Failed" : "Pending"}
            </AppText>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Transactions</AppText>
        <View style={{ width: 24 }} />
      </View>

      {/* FILTER BAR */}
      <View style={styles.filterBar}>
        {/* STATUS */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => {
            setStatusOpen(!statusOpen);
          }}
        >
          <AppText>{status}</AppText>
          <Ionicons name="chevron-down" size={16} />
        </TouchableOpacity>
      </View>

      {/* STATUS DROPDOWN */}
      {statusOpen && (
        <View style={styles.dropdownMenu}>
          {STATUS_FILTERS.map(s => (
            <TouchableOpacity
              key={s}
              style={styles.dropdownItem}
              onPress={() => {
                setStatus(s);
                setStatusOpen(false);
              }}
            >
              <AppText>{s}</AppText>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* LIST */}
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : error ? (
          <AppText style={{ color: 'red' }}>{error}</AppText>
        ) : filtered.length === 0 ? (
          <AppText>No Data Found</AppText>
        ) : (
          Object.entries(grouped).map(([month, items]) => (
            <View key={month}>
              <AppText style={styles.month}>{month}</AppText>
              {items.map(renderCard)}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default TransactionScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 4,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  filterBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
  },

  dropdown: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    borderRadius: 10,
    backgroundColor: COLORS.card,
  },

  dropdownMenu: {
    position: 'absolute',
    top: 140,
    left: 16,
    right: 16,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    elevation: 5,
    zIndex: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  dropdownItem: {
    padding: 12,
  },

  month: {
    marginVertical: 10,
    fontWeight: '700',
    color: COLORS.text,
  },

  card: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    alignItems: 'center',
    backgroundColor: COLORS.card,
  },

  titleText: {
    fontWeight: '700',
    color: COLORS.text,
  },

  subText: {
    fontSize: 12,
    color: COLORS.subText,
  },

  amount: {
    fontWeight: '700',
    fontSize: 16,
  },
});