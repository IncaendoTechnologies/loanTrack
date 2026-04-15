import { Auth } from 'aws-amplify';
import React, { useState } from 'react';
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { createUser } from '../apis/userApi';
import type { CognitoUser } from '../types/types';
import BackArrow from '../components/BackArrow';
import LoanTrackLogo from '../components/LoanTrackLogo';
import styles from '../stylesheets/ConfirmSignUpStyles';

const ConfirmSignUpScreen = ({ route, navigation }: any) => {
  const { email, password, phoneNumber, firstName, lastName } = route.params || {};
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const createBackendUser = async (cognitoSub: string) => {
    let userEmail = email;
    let userPhoneNumber = phoneNumber;
    let userFirstName = firstName;
    let userLastName = lastName;

    if (!userEmail || !userPhoneNumber || !userFirstName || !userLastName) {
      try {
        const currentUser = (await Auth.currentAuthenticatedUser()) as CognitoUser;
        userEmail = userEmail || currentUser.attributes.email;
        userPhoneNumber = userPhoneNumber || currentUser.attributes.phone_number;
        userFirstName = userFirstName || currentUser.attributes.given_name;
        userLastName = userLastName || currentUser.attributes.family_name;
      } catch (authError) {
        console.log('Unable to load Cognito attributes for backend user creation:', authError);
      }
    }

    if (!userEmail || !userPhoneNumber || !userFirstName || !userLastName) {
      console.log('Skipping backend user creation because required profile details are missing.');
      return;
    }

    try {
      await createUser({
        id: cognitoSub,
        owner: cognitoSub,
        email: userEmail,
        phoneNumber: userPhoneNumber,
        firstName: userFirstName,
        lastName: userLastName,
      });
    } catch (error) {
      console.log('Create backend user error:', error);
    }
  };

  const signInAndReturnSub = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    await Auth.signIn(normalizedEmail, password);
    const user = (await Auth.currentAuthenticatedUser()) as CognitoUser;
    return user.attributes.sub;
  };

  const handleConfirm = async () => {
    if (!code) {
      setErrorMessage('Please enter the verification code.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const normalizedEmail = email.trim().toLowerCase();
      await Auth.confirmSignUp(normalizedEmail, code);
      const cognitoSub = await signInAndReturnSub();
      navigation.replace('MainTabs');
      createBackendUser(cognitoSub);
    } catch (error) {
      console.log('Confirm Error:', error);
      const authError = error as any;
      const errorCode = authError?.code || authError?.name;
      const message = authError?.message || String(error);

      if (errorCode === 'ExpiredCodeException') {
        setErrorMessage('Verification code expired. Please resend OTP.');
        Alert.alert('Error', 'Code expired. Request a new code.');
        return;
      }

      if (
        errorCode === 'NotAuthorizedException' &&
        message.includes('Current status is CONFIRMED')
      ) {
        try {
          const cognitoSub = await signInAndReturnSub();
          navigation.replace('MainTabs');
          createBackendUser(cognitoSub);
          return;
        } catch (innerError) {
          const innerAuthError = innerError as any;
          const innerMessage = innerAuthError?.message || String(innerError);
          console.log('SignIn after confirm error:', innerError);
          setErrorMessage(
            `Confirmed, but unable to sign in: ${innerMessage}. Please check your password.`
          );
          Alert.alert('Error', 'Confirmed, but unable to sign in. Please check your password.');
          return;
        }
      }

      if (errorCode === 'CodeMismatchException') {
        setErrorMessage('Invalid verification code. Please check the OTP and try again.');
        Alert.alert('Error', 'Invalid verification code. Please try again.');
        return;
      }

      setErrorMessage(message);
      Alert.alert('Error', 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      await Auth.resendSignUp(normalizedEmail);
      Alert.alert('Success', 'Verification code sent.');
    } catch (error) {
      console.log('Resend OTP Error:', error);
      Alert.alert('Error', 'Could not resend code. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackArrow onPress={() => navigation.goBack()} />
      </View>
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

