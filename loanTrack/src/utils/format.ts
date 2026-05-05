export const formatCurrencyIN = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0.00';
  }

  // Ensure exactly two decimal digits
  const fixedAmount = Number(amount).toFixed(2);
  const parts = fixedAmount.split('.');
  const integerPart = parts[0];
  const decimalPart = '.' + parts[1];

  if (integerPart.length <= 3) {
    return integerPart + decimalPart;
  }

  const lastThreeDigits = integerPart.substring(integerPart.length - 3);
  const otherDigits = integerPart.substring(0, integerPart.length - 3);
  
  let formattedInteger = lastThreeDigits;
  if (otherDigits !== '') {
    formattedInteger = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThreeDigits;
  }

  return formattedInteger + decimalPart;
};
