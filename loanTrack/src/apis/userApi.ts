import { handleResponse, requestWithFallback } from './client';
import { UserPayload, UserRecord } from '../interfaces';

export const createUser = async (payload: UserPayload): Promise<UserRecord> => {
  const response = await requestWithFallback('/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse<UserRecord>(response);
};

export const getUserById = async (id: string): Promise<UserRecord> => {
  const response = await requestWithFallback(`/users/${id}`);
  return handleResponse<UserRecord>(response);
};

export const getUserByIdOrNull = async (id: string): Promise<UserRecord | null> => {
  const response = await requestWithFallback(`/users/${id}`);
  if (response.status === 404) {
    return null;
  }
  return handleResponse<UserRecord>(response);
};
