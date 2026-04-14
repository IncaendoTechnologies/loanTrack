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

  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.primary,
  },

  label: {
    fontSize: 12,
    color: '#ddd',
  },

  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },

  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  headerText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
  },

  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 10,
  },

  month: {
    flex: 1,
    color: COLORS.primary,
    fontWeight: '600',
  },

  text: {
    flex: 1,
    fontSize: 12,
  },

  balance: {
    flex: 1,
    textAlign: 'right',
    fontWeight: '600',
  },
});

export default styles;
