import { Auth } from 'aws-amplify';
import React, { useState } from 'react';
import {
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { saveAccessTokenFromCognitoSession } from '../services/session';
import { getUserByIdOrNull } from '../apis/userApi';
import LoanTrackLogo from '../components/LoanTrackLogo';
import styles from '../stylesheets/SignInStyles';

const SignInScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignIn = async () => {
    if (!email || !password) {
      setErrorMessage('Email and password are required.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      await Auth.signIn(email, password);
      await saveAccessTokenFromCognitoSession();
      const user = await Auth.currentAuthenticatedUser();
      const cognitoSub = user?.attributes?.sub as string;

      navigation.replace('MainTabs');

      getUserByIdOrNull(cognitoSub).catch((profileError) => {
        console.log('Profile fetch warning:', profileError);
      });
    } catch (error) {
      console.log('SignIn Error:', error);
      const message = (error as any)?.message || String(error);
      setErrorMessage(message);
      Alert.alert('Error', 'Unable to sign in. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandContainer}>
        <LoanTrackLogo width={160} height={80} />
      </View>
      <Text style={styles.title}>Sign In</Text>
      

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

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
  );
};

export default SignInScreen;
