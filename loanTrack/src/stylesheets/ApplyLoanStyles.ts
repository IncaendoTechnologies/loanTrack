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
    alignItems: 'center',
    gap: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 16,
  },

  inputGroup: {
    marginBottom: 16,
  },

  label: {
    marginBottom: 6,
    fontSize: 13,
    color: '#555',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },

  button: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },

  buttonText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },
  errorText: {
    color: '#DC2626',
    marginTop: 10,
    fontSize: 13,
  },

  noteBox: {
    marginTop: 20,
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 10,
  },

  noteText: {
    fontSize: 12,
    color: '#444',
  },
});

export default styles;