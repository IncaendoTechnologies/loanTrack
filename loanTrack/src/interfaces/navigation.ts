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

export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ConfirmSignUp: ConfirmSignUpParams;
  MainTabs: undefined;
  EmiResult: EmiResultParams;
  PaymentSchedule: PaymentScheduleParams;
};
