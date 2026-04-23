import { NavigatorScreenParams } from '@react-navigation/native';
import { LoanRecord } from './loan';

export interface ConfirmSignUpParams {
  email: string;
  password: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
}

export interface EmiResultParams {
  loan: LoanRecord;
  isNew?: boolean;
}

export interface PaymentScheduleParams {
  loan: LoanRecord;
}

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ConfirmSignUp: ConfirmSignUpParams;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  MainTabs: undefined;
  EmiResult: EmiResultParams;
  PaymentSchedule: PaymentScheduleParams;
};
