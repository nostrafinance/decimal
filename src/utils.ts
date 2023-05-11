export const abs = (value: bigint): bigint => (value > 0 ? value : -value);

export const increasePrecision = (value: bigint, increment: number): bigint => {
  const multiplicand = 10n ** BigInt(increment);
  return value * multiplicand;
};

export const decreasePrecision = (value: bigint, decrement: number): bigint => {
  const divisor = 10n ** BigInt(decrement);
  return value / divisor;
};

export const formatUnits = (value: bigint, decimals: number): string => {
  const precision = 10n ** BigInt(decimals);

  const sign = value < 0 ? '-' : '';
  const integral = abs(value / precision);
  const fraction = abs(value % precision)
    .toString()
    .padStart(decimals, '0')
    .replace(/0*$/g, '');

  return `${sign}${integral}${fraction ? `.${fraction}` : ''}`;
};

export const parseUnits = (value: string, decimals: number): bigint => {
  if (!value) {
    throw new Error('parseUnits() - Value is empty!');
  }

  if (isNaN(Number(value))) {
    throw new Error(`parseUnits() - Value ${value} is not a valid number string!`);
  }

  const precision = 10n ** BigInt(decimals);

  const [integral, fraction] = value.split('.');

  const sign = value.startsWith('-') ? '-' : '';

  return (
    (abs(BigInt(integral)) * precision + BigInt((fraction || '').padEnd(decimals, '0'))) * (sign === '-' ? -1n : 1n)
  );
};
