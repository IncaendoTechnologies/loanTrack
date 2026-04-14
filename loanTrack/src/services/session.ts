import AsyncStorage from '@react-native-async-storage/async-storage';
import { Auth } from 'aws-amplify';

const ACCESS_TOKEN_KEY = 'accessToken';

export const saveAccessTokenFromCognitoSession = async () => {
  const session = await Auth.currentSession();
  const accessToken = session.getAccessToken().getJwtToken();
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  return accessToken;
};

export const clearSessionToken = async () => {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
};
