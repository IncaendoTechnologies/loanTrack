const LOAN_LIMIT_OPTIONS = [500000, 70000, 100000, 50000] as const;

export const getRandomLoanLimit = () => {
  const index = Math.floor(Math.random() * LOAN_LIMIT_OPTIONS.length);
  return LOAN_LIMIT_OPTIONS[index];
};
