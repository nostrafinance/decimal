export const abs = (value: bigint): bigint => (value > 0 ? value : -value);

export const increasePrecision = (value: bigint, increment: number): bigint => {
  const multiplicand = 10n ** BigInt(increment);
  return value * multiplicand;
};

export const decreasePrecision = (value: bigint, decrement: number): bigint => {
  const divisor = 10n ** BigInt(decrement);
  return value / divisor;
};
