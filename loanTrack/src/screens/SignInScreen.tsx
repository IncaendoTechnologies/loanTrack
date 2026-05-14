import { Auth } from 'aws-amplify';
import React, { useState } from 'react';
import {
  ToastAndroid,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { createUser, getUserByIdOrNull } from '../apis/userApi';
import LoanTrackLogo from '../components/LoanTrackLogo';
import type { CognitoUser } from '../types/types';
import styles from '../stylesheets/SignInStyles';
import { UserPayload } from 'src/interfaces/user';

const SignInScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const ensureBackendUser = async (user: CognitoUser) => {
    const cognitoSub = user.attributes.sub;
    const existingProfile = await getUserByIdOrNull(cognitoSub);
    if (existingProfile) return;

    const payload = {
      id: cognitoSub,
      owner: cognitoSub,
      email: user.attributes.email,
      phoneNumber: user.attributes.phone_number,
      firstName: user.attributes.given_name,
      lastName: user.attributes.family_name,
    };

    if (!payload.email || !payload.phoneNumber || !payload.firstName || !payload.lastName) {
      console.log('Cannot create backend user: missing Cognito attributes', payload);
      return;
    }

    try {
      await createUser(payload as UserPayload);
    } catch (createError) {
      console.log('Create backend user after sign-in error:', createError);
    }
  };

  const handleSignIn = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setErrorMessage('Email and password are required.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      await Auth.signIn(normalizedEmail, password);
      const user = (await Auth.currentAuthenticatedUser()) as CognitoUser;
      await ensureBackendUser(user);
      navigation.replace('MainTabs');
    } catch (error) {
      const authError = error as any;
      console.log('SignIn Error:', authError);

      if (authError?.name === 'UserNotConfirmedException') {
        navigation.navigate('ConfirmSignUp', { email: normalizedEmail, password });
        return;
      }

      const message = authError?.message || String(error);
      const isUnconfirmed =
        authError?.name === 'UserNotConfirmedException' ||
        (authError?.name === 'NotAuthorizedException' &&
          message?.toLowerCase().includes('not confirmed'));

      if (isUnconfirmed) {
        try {
          await Auth.resendSignUp(normalizedEmail);
        } catch (resendError) {
          console.log('Resend sign-up error:', resendError);
        }
        navigation.navigate('ConfirmSignUp', { email: normalizedEmail, password });
        return;
      }

      setErrorMessage(message);

      ToastAndroid.show('Error: Unable to sign in. Please check your details.', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <View style={styles.brandContainer}>
            <LoanTrackLogo width={160} height={80} />
          </View>
          <Text style={styles.title}>Sign In</Text>

          <TextInput
            placeholder="Email"
            placeholderTextColor="#999"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.eyeText}>
                {showPassword ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Logging...' : 'Log In'}</Text>
          </TouchableOpacity>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Text onPress={() => navigation.navigate('SignUp')}>
            Don’t have an account? Sign Up
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default SignInScreen;
