import { StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },

  header: {
    alignItems: 'center',
    marginTop: 20,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },

  name: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },

  email: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 20,
    paddingVertical: 10,
  },

  cardTitle: {
    fontSize: 12,
    color: '#888',
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 0.5,
    borderColor: '#eee',
  },

  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },

  itemText: {
    marginLeft: 10,
    fontSize: 14,
  },

  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 10,
  },

  logoutText: {
    color: '#DC2626',
    marginLeft: 6,
    fontWeight: '600',
  },

  footer: {
    alignItems: 'center',
    marginTop: 20,
  },

  version: {
    fontSize: 12,
    color: '#999',
  },
  errorText: {
    marginTop: 6,
    color: '#DC2626',
    fontSize: 12,
    textAlign: 'center',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default styles;
