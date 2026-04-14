import { Auth } from 'aws-amplify';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { createUser, getUserByIdOrNull } from '../apis/userApi';
import { saveAccessTokenFromCognitoSession } from '../services/session';
import LoanTrackLogo from '../components/LoanTrackLogo';

const ConfirmSignUpScreen = ({ route, navigation }: any) => {
  const { email, password, phoneNumber, firstName, lastName } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const createBackendUser = async (cognitoSub: string) => {
    try {
      await createUser({
        id: cognitoSub,
        owner: cognitoSub,
        email,
        phoneNumber,
        firstName,
        lastName,
      });
    } catch (error) {
      console.log('Create backend user error:', error);
    }
  };

  const signInAndSaveToken = async () => {
    const session = await Auth.signIn(email, password);
    await saveAccessTokenFromCognitoSession();
    return session?.attributes?.sub as string;
  };

  const handleConfirm = async () => {
    if (!code) {
      setErrorMessage('Please enter the verification code.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      await Auth.confirmSignUp(email, code);
      const cognitoSub = await signInAndSaveToken();
      navigation.replace('MainTabs');
      createBackendUser(cognitoSub);
    } catch (error) {
      console.log('Confirm Error:', error);
      const errorCode = (error as { code?: string }).code;
      const message = (error as any)?.message || String(error);

      if (errorCode === 'ExpiredCodeException') {
        setErrorMessage('Verification code expired. Please resend OTP.');
        Alert.alert('Error', 'Code expired. Request a new code.');
        return;
      }

      if (errorCode === 'NotAuthorizedException' && message.includes('Current status is CONFIRMED')) {
        try {
          const cognitoSub = await signInAndSaveToken();
          navigation.replace('MainTabs');
          createBackendUser(cognitoSub);
          return;
        } catch (innerError) {
          console.log('SignIn after confirm error:', innerError);
        }
      }

      setErrorMessage(message);
      Alert.alert('Error', 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await Auth.resendSignUp(email);
      Alert.alert('Success', 'Verification code sent.');
    } catch (error) {
      console.log('Resend OTP Error:', error);
      Alert.alert('Error', 'Could not resend code. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
       <View style={styles.brandContainer}>
        <LoanTrackLogo width={160} height={80} />
      </View>
      <Text style={styles.title}>Verify OTP</Text>

      <TextInput
        placeholder="Enter OTP"
        style={styles.input}
        value={code}
        onChangeText={setCode}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleConfirm}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify'}</Text>
      </TouchableOpacity>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <TouchableOpacity style={styles.linkButton} onPress={handleResendCode}>
        <Text style={styles.linkText}>Resend OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ConfirmSignUpScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
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