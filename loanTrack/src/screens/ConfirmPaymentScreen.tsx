import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, ToastAndroid, ScrollView } from 'react-native';
import AppText from '../components/AppText';
import { Auth } from 'aws-amplify';
import BackArrow from '../components/BackArrow';
import { confirmPayment, sendOtp } from '../apis/paymentService';
import styles from '../stylesheets/ConfirmPaymentStyles';
const ConfirmPaymentScreen = ({ navigation, route }: any) => {
  const [transactionId, setTransactionId] = useState(route.params?.transactionId || '');
  const [amount, setAmount] = useState(route.params?.amount || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Trigger Cognito OTP on mount
  React.useEffect(() => {
    checkAuthAndData();
  }, [route.params]);

  const checkAuthAndData = async () => {
    try {
      await Auth.currentAuthenticatedUser();

      if (route.params?.transactionId) {
        setTransactionId(route.params.transactionId);
      }
      if (route.params?.amount) {
        setAmount(route.params.amount);
      }

      if (route.params?.isSuccessFlow) {
        // Registration webhook already completed the payment
        setOtpSent(false); // don't show OTP fields
        ToastAndroid.show('Success: Payment processed successfully during registration!', ToastAndroid.LONG);
        navigation.replace('MainTabs');
        return;
      }

      sendCognitoOTP();
    } catch (err: any) {
      console.log('Not authenticated, redirecting to Auth stack');
      if (route.params?.fromEmail) {
        navigation.replace('Auth', {
          screen: 'SignUp',
          params: { ...route.params }
        });
      } else {
        navigation.replace('Auth');
      }
    }
  };

  const sendCognitoOTP = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const userId = user.attributes.sub;
      const response = await sendOtp({
        transactionId,
        userId,
      })
      if (response.statusCode == 200) {
        setOtpSent(true);
        ToastAndroid.show('Success: OTP has been sent to your registered email.', ToastAndroid.SHORT);
      } else {
        ToastAndroid.show('Failed to send OTP', ToastAndroid.SHORT);
      }
    } catch (err: any) {
      ToastAndroid.show('Failed to send OTP', ToastAndroid.SHORT);
    }
  };

  const handleConfirm = async () => {
    if (!otp) {
      ToastAndroid.show('Error: Please enter the OTP code', ToastAndroid.SHORT);
      return;
    }

    setLoading(true);
    try {
      const cognitoUser = await Auth.currentAuthenticatedUser();
      const userId = cognitoUser.attributes.sub;
      const response = await confirmPayment({
        transactionId,
        userId,
        otp,
        isVerifiedByCognito: false
      })
      if (response.statusCode !== 200) {
        throw new Error(response.message || 'Payment confirmation failed');
      }

      ToastAndroid.show('Success: Payment confirmed successfully!', ToastAndroid.LONG);
      navigation.replace('MainTabs');
    } catch (err: any) {
      ToastAndroid.show('Verification Failed: Failed to confirm payment', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('MainTabs');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackArrow onPress={handleBack} />
        <AppText style={styles.headerTitle}>Confirm Payment</AppText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AppText style={styles.subTitle}>Verify the details and enter the OTP sent to your email.</AppText>

        {amount ? (
          <View style={styles.amountContainer}>
            <AppText style={styles.amountLabel}>Amount to Pay</AppText>
            <AppText style={styles.amountValue}>₹{amount}</AppText>
          </View>
        ) : null}

        <View style={styles.inputContainer}>
          <AppText style={styles.label}>Transaction ID</AppText>
          <TextInput
            style={[styles.input, route.params?.transactionId && styles.disabledInput]}
            placeholder="txn_..."
            placeholderTextColor="#999"
            value={transactionId}
            onChangeText={setTransactionId}
            autoCapitalize="none"
            editable={!route.params?.transactionId}
          />
        </View>

        {otpSent && (
          <>
            <View style={styles.inputContainer}>
              <AppText style={styles.label}>OTP Code</AppText>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit OTP"
                placeholderTextColor="#999"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleConfirm} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <AppText style={styles.buttonText}>Confirm Payment</AppText>}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default ConfirmPaymentScreen;
