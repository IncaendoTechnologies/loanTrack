import { StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

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

export default styles;