import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-start', padding: 20, paddingTop: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 130,
  },
  title: { fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  buttonText: { color: '#fff', textAlign: 'center' },
  errorText: {
    color: '#DC2626',
    marginTop: 10,
    textAlign: 'center',
  },
  linkButton: {
    marginTop: 14,
    alignItems: 'center',
  },
  linkText: {
    color: '#007bff',
    fontWeight: '600',
  },
});
export default styles;