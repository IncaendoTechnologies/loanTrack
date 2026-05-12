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
import { getTransactions } from '../apis/transactionApi';
import type { ApiTransaction } from '../interfaces/transaction';

const STATUS_FILTERS = [
  { label: 'All', value: 'All' },
  { label: 'Repayment', value: 'REPAYMENT' },
  { label: 'Disbursement', value: 'DISBURSEMENT' },
  { label: 'Wallet Transfer', value: 'WALLET_TRANSFER' }
] as const;

const TransactionScreen = ({ navigation }: any) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<ApiTransaction[]>([]);
  const [error, setError] = useState('');

  const [status, setStatus] = useState<string>('All');

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
    const amountColor = isFailed ? '#DC2626' : isDebit ? '#DC2626' : '#16A34A';

    let actionText = '';
    let mainName = item.note || item.type;
    let subtitle = new Date(item.date).toDateString();
    let counterpartyName = '';

    if (item.type === 'WALLET_TRANSFER') {
      if (isDebit && item.receiver?.name) {
        counterpartyName = item.receiver.name;
        actionText = 'Paid to';
        mainName = counterpartyName;
      } else if (!isDebit && item.sender?.name) {
        counterpartyName = item.sender.name;
        actionText = 'Received from';
        mainName = counterpartyName;
      }
    } else if (item.type === 'DISBURSEMENT') {
      mainName = 'Added from Loan';
    } else if (item.type === 'REPAYMENT') {
      mainName = 'Repaid Loan';
    }

    const initials = counterpartyName
      ? counterpartyName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : null;

    let iconName = 'wallet-outline';
    if (item.type === 'DISBURSEMENT') iconName = 'arrow-down-outline';
    if (item.type === 'REPAYMENT') iconName = 'arrow-up-outline';
    if (item.type === 'WALLET_TRANSFER') {
      iconName = isDebit ? 'arrow-up-outline' : 'arrow-down-outline';
    }

    return (
      <View key={item.transactionId} style={[styles.card, styles.borderColorLeft]}>
        <View style={styles.avatar}>
          {initials ? (
            <AppText style={styles.avatarText}>{initials}</AppText>
          ) : (
            <Ionicons name={iconName as any} size={20} color={COLORS.primary} />
          )}
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          {actionText ? (
            <AppText style={styles.actionText}>{actionText}</AppText>
          ) : null}
          <AppText style={styles.titleText} numberOfLines={1}>{mainName}</AppText>
          <AppText style={styles.subText}>{subtitle}</AppText>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <AppText style={[styles.amount, { color: amountColor }]}>
            {isDebit ? '-' : '+'}{' '}₹{Math.abs(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </AppText>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
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
          <AppText>{STATUS_FILTERS.find(f => f.value === status)?.label || 'All'}</AppText>
          <Ionicons name="chevron-down" size={16} />
        </TouchableOpacity>
      </View>

      {/* STATUS DROPDOWN */}
      {statusOpen && (
        <View style={styles.dropdownMenu}>
          {STATUS_FILTERS.map(s => (
            <TouchableOpacity
              key={s.value}
              style={styles.dropdownItem}
              onPress={() => {
                setStatus(s.value);
                setStatusOpen(false);
              }}
            >
              <AppText>{s.label}</AppText>
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

  actionText: {
    fontSize: 12,
    color: COLORS.subText,
    marginBottom: 2,
  },

  titleText: {
    fontWeight: '700',
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 4,
  },
  borderColorLeft: {
    borderLeftColor: COLORS.primary,
    borderLeftWidth: 3,
  },
  subText: {
    fontSize: 12,
    color: COLORS.subText,
  },

  amount: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  }
});