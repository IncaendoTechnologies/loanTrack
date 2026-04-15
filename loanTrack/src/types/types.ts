export type CognitoUser = {
  attributes: {
    sub: string;
    email?: string;
    given_name?: string;
    family_name?: string;
    phone_number?: string;
  };
};

export type { RootStackParamList } from '../interfaces';