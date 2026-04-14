import { StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },

  list: {
    flex: 1,
    padding: 12,
  },

  row: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  month: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  cell: {
    fontSize: 13,
    fontWeight: '600',
  },
  subText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
  },
});
export default styles;