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
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },

  centerBox: {
    alignItems: 'center',
    marginTop: 30,
  },

  label: {
    fontSize: 12,
    color: '#777',
  },

  emi: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 6,
  },

  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
  },

  successText: {
    marginLeft: 4,
    color: '#16A34A',
    fontSize: 12,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 20,
    overflow: 'hidden',
  },

  cardTitle: {
    padding: 12,
    fontWeight: '600',
  },

  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderTopWidth: 0.5,
    borderColor: '#eee',
  },

  row: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  errorContainer: {
    marginTop: 16,
    paddingHorizontal: 12,
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
  },

  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  outlineText: {
    color: COLORS.primary,
    marginLeft: 6,
  },

  primaryBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryText: {
    color: '#fff',
    fontWeight: '600',
  },
});


export default styles;
