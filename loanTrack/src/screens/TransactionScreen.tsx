import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import AppText from '../components/AppText';
import { COLORS } from '../theme/colors';

interface EmiPayment {
  id: string;
  transactionId: string;
  loanId: string;
  amount: number;
  date: string; // ISO format
  month: string;
  status: 'Paid' | 'Pending' | 'Failed';
}

const DUMMY_PAYMENTS: EmiPayment[] = [
  { id: '1', transactionId: 'TXN202504010001', loanId: 'LN00123456', amount: 5200, date: '2025-04-01', month: 'Apr 2025', status: 'Paid' },
  { id: '2', transactionId: 'TXN202503010002', loanId: 'LN00123456', amount: 5200, date: '2025-03-01', month: 'Mar 2025', status: 'Paid' },
  { id: '3', transactionId: 'TXN202503150003', loanId: 'LN00789012', amount: 8750, date: '2025-03-15', month: 'Mar 2025', status: 'Pending' },
  { id: '4', transactionId: 'TXN202502150004', loanId: 'LN00789012', amount: 8750, date: '2025-02-15', month: 'Feb 2025', status: 'Failed' },
  { id: '5', transactionId: 'TXN202501200005', loanId: 'LN00345678', amount: 3400, date: '2025-01-20', month: 'Jan 2025', status: 'Paid' },
  { id: '6', transactionId: 'TXN202412200006', loanId: 'LN00345678', amount: 3400, date: '2024-12-20', month: 'Dec 2024', status: 'Failed' },
  { id: '7', transactionId: 'TXN202411010007', loanId: 'LN00123456', amount: 5200, date: '2024-11-01', month: 'Nov 2024', status: 'Paid' },
];

const STATUS_FILTERS = ['All', 'Paid', 'Pending', 'Failed'] as const;
const MONTH_FILTERS = ['All', 'Apr 2025', 'Mar 2025', 'Feb 2025', 'Jan 2025', 'Dec 2024'] as const;

const STATUS_CONFIG = {
  Paid: { color: '#16A34A', bg: '#F0FDF4', icon: 'checkmark-circle' },
  Pending: { color: '#D97706', bg: '#FFFBEB', icon: 'time-outline' },
  Failed: { color: '#DC2626', bg: '#FEF2F2', icon: 'close-circle' },
};

const TransactionScreen = ({ navigation }: any) => {
  const [refreshing, setRefreshing] = useState(false);
  const [payments] = useState(DUMMY_PAYMENTS);

  const [status, setStatus] = useState<typeof STATUS_FILTERS[number]>('All');
  const [month, setMonth] = useState<typeof MONTH_FILTERS[number]>('All');

  const [statusOpen, setStatusOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filtered = useMemo(() => {
    return payments
      .filter(p => {
        const statusMatch = status === 'All' || p.status === status;
        const monthMatch = month === 'All' || p.month === month;
        return statusMatch && monthMatch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [payments, status, month]);

  const grouped = useMemo(() => {
    const map: Record<string, EmiPayment[]> = {};
    filtered.forEach(p => {
      if (!map[p.month]) map[p.month] = [];
      map[p.month].push(p);
    });
    return map;
  }, [filtered]);

  const renderCard = (item: EmiPayment) => {
    const s = STATUS_CONFIG[item.status];
    return (
      <View key={item.id} style={styles.card}>
        {/* <View style={[styles.iconContainer, { backgroundColor: s.bg }]}>
          <Ionicons name={s.icon as any} size={22} color={s.color} />
        </View> */}

        <View style={{ flex: 1 }}>
          <AppText style={styles.titleText}>EMI Payment</AppText>
          <AppText style={styles.subText}>{item.transactionId}</AppText>
          <AppText style={styles.subText}>
            {new Date(item.date).toDateString()}
          </AppText>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <AppText style={[styles.amount, { color: s.color }]}>
            ₹{item.amount}
          </AppText>
          <AppText style={{ color: s.color, fontSize: 12 }}>
            {item.status}
          </AppText>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>History</AppText>
      </View>

      {/* FILTER BAR */}
      <View style={styles.filterBar}>
        {/* STATUS */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => {
            setStatusOpen(!statusOpen);
            setMonthOpen(false);
          }}
        >
          <AppText>{status}</AppText>
          <Ionicons name="chevron-down" size={16} />
        </TouchableOpacity>

        {/* MONTH */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => {
            setMonthOpen(!monthOpen);
            setStatusOpen(false);
          }}
        >
          <AppText>{month}</AppText>
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

      {/* MONTH DROPDOWN */}
      {monthOpen && (
        <View style={styles.dropdownMenu}>
          {MONTH_FILTERS.map(m => (
            <TouchableOpacity
              key={m}
              style={styles.dropdownItem}
              onPress={() => {
                setMonth(m);
                setMonthOpen(false);
              }}
            >
              <AppText>{m}</AppText>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* LIST */}
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filtered.length === 0 ? (
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
    gap: 10,
    padding: 16,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  filterBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
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
  },

  dropdownMenu: {
    position: 'absolute',
    top: 110,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
    zIndex: 10,
  },

  dropdownItem: {
    padding: 12,
  },

  month: {
    marginVertical: 10,
    fontWeight: '700',
  },

  card: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    alignItems: 'center',
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  titleText: {
    fontWeight: '700',
  },

  subText: {
    fontSize: 12,
    color: COLORS.subText,
  },

  amount: {
    fontWeight: '700',
  },
});