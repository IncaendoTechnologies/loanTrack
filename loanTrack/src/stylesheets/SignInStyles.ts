import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandImage: {
    width: 150,
    height: 150,
  },
  brandText: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: '700',
    color: '#007bff',
  },
  title: { fontSize: 24, marginBottom: 15, fontWeight: 'bold', textAlign: 'left' },
  input: {
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  buttonText: { color: '#fff', textAlign: 'center' },
  errorText: {
    color: '#DC2626',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default styles;
