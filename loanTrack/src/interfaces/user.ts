export interface UserPayload {
  id: string;
  owner: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  loanLimit?: number;
}

export interface UserRecord extends UserPayload {
  loanLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface CognitoProfile {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}
