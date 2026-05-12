import React, { useState } from 'react';
import {
  ToastAndroid,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Auth } from 'aws-amplify';
import LoanTrackLogo from '../components/LoanTrackLogo';
import styles from '../stylesheets/SignUpStyles';

const SignUpScreen = ({ navigation, route }: any) => {
  React.useEffect(() => {
    console.log('[SignUpScreen] Mounted with params:', route.params);
  }, [route.params]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(
    route?.params?.fromEmail ? decodeURIComponent(route.params.fromEmail) : ''
  );
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      setErrorMessage('All fields are required.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const normalizedEmail = email.trim().toLowerCase();
      await Auth.signUp({
        username: normalizedEmail,
        password,
        attributes: {
          email: normalizedEmail,
          phone_number: phoneNumber,
          given_name: firstName,
          family_name: lastName,
        },
      });

      navigation.navigate('ConfirmSignUp', {
        email,
        password,
        phoneNumber,
        firstName,
        lastName,
        ...route.params
      });
    } catch (error) {
      console.log('SignUp Error:', error);
      const message = (error as any)?.message || String(error);
      setErrorMessage(message);
      ToastAndroid.show('Error: Unable to sign up. Please try again.', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandContainer}>
        <LoanTrackLogo width={160} height={80} />
      </View>

      <Text style={styles.title}>Create Account</Text>

      <TextInput
        placeholder="First Name"
        placeholderTextColor="#999"
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
      />

      <TextInput
        placeholder="Last Name"
        placeholderTextColor="#999"
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor="#999"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Mobile (+91...)"
        placeholderTextColor="#999"
        style={styles.input}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Signing up...' : 'Sign Up'}</Text>
      </TouchableOpacity>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <Text onPress={() => navigation.navigate('SignIn')}>
        Already have an account? Sign In
      </Text>
    </View>
  );
};

export default SignUpScreen;
