import { Auth } from 'aws-amplify';

type AmplifySessionWithAccessToken = {
  getAccessToken?: () => {
    getJwtToken?: () => string;
  };
};

export const getCognitoAccessToken = async (): Promise<string | null> => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    const accessToken = (user as any)?.signInUserSession?.accessToken?.jwtToken;

    if (typeof accessToken === 'string') {
      return accessToken;
    }

    const auth = Auth as any;
    const session = await (typeof auth.currentSession === 'function'
      ? auth.currentSession()
      : auth.fetchAuthSession?.());
    return typeof session?.getAccessToken?.()?.getJwtToken?.() === 'string'
      ? session.getAccessToken().getJwtToken()
      : null;
  } catch (error) {
    console.warn('Unable to fetch Cognito auth session token', error);
    return null;
  }
};
