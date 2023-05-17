import { abs, decreasePrecision, formatUnits, increasePrecision, parseUnits } from './utils';

export type Numberish = Decimal | string | number;
export type BigNumberish = bigint | Numberish;

export default class Decimal {
  static readonly PRECISION = 18;

  static readonly ZERO = new Decimal(0);
  static readonly ONE = new Decimal(1);
  static readonly MAX_DECIMAL = new Decimal(2n ** 256n - 1n, Decimal.PRECISION);

  readonly value: bigint;
  readonly precision = Decimal.PRECISION;

  // In case user passes BN as value, we also need user to provide precision
  constructor(value: bigint, valuePrecision: number);
  // In case user passes (number | string | Decimal) as value, we don't need precision because
  // we can safely convert (number | string | Decimal) to bigint with 18 decimal precision.
  constructor(value: Numberish);

  constructor(value: BigNumberish, valuePrecision: number = Decimal.PRECISION) {
    // In case we pass in Decimal, underlying value inside the Decimal is already 18 decimal precision
    if (value instanceof Decimal) {
      this.value = value.value;
    } else if (typeof value === 'number' || typeof value === 'string') {
      // In case user passes (number | string), attempt to create bigint from passed value using parseUnits()

      try {
        // the decimal part may exceed the precision range, check and truncate
        const strValue = `${value}`;
        const decimalPointIndex = strValue.indexOf('.');
        const truncatedValue =
          decimalPointIndex >= 0 ? strValue.substring(0, decimalPointIndex + valuePrecision + 1) : strValue;
        this.value = parseUnits(truncatedValue, valuePrecision);
      } catch (e) {
        throw new Error(`Failed to parse ${value} when creating Decimal`);
      }
    } else {
      // In case we pass in bigint as value, need to convert it to 18 decimal
      // precision bigint before storing it inside value

      if (valuePrecision === Decimal.PRECISION) {
        this.value = value;
      } else if (valuePrecision < Decimal.PRECISION) {
        this.value = increasePrecision(value, Decimal.PRECISION - valuePrecision);
      } else {
        this.value = decreasePrecision(value, valuePrecision - Decimal.PRECISION);
      }
    }
  }

  static parse(value: bigint, defaultValue: bigint, valuePrecision: number): Decimal;
  static parse(value: Numberish, defaultValue: Numberish): Decimal;
  static parse(value: BigNumberish, defaultValue: BigNumberish, valuePrecision = Decimal.PRECISION): Decimal {
    try {
      if (typeof value === 'bigint') {
        return new Decimal(value, valuePrecision);
      }
      return new Decimal(value);
    } catch (e) {
      if (typeof defaultValue === 'bigint') {
        return new Decimal(defaultValue, valuePrecision);
      }
      return new Decimal(defaultValue);
    }
  }

  static max(a: Numberish, b: Numberish) {
    const decimalA = new Decimal(a);
    const decimalB = new Decimal(b);
    return decimalA.gt(decimalB) ? decimalA : decimalB;
  }

  static min(a: Numberish, b: Numberish) {
    const decimalA = new Decimal(a);
    const decimalB = new Decimal(b);
    return decimalA.lt(decimalB) ? decimalA : decimalB;
  }

  add(addend: Numberish): Decimal {
    const decimal = new Decimal(addend);

    return new Decimal(this.value + decimal.value, Decimal.PRECISION);
  }

  sub(subtrahend: Numberish): Decimal {
    const decimal = new Decimal(subtrahend);

    return new Decimal(this.value - decimal.value, Decimal.PRECISION);
  }

  mul(multiplicand: Numberish): Decimal {
    const decimal = new Decimal(multiplicand);
    const product = decreasePrecision(this.value * decimal.value, Decimal.PRECISION);

    return new Decimal(product, Decimal.PRECISION);
  }

  div(divisor: Numberish): Decimal {
    const decimal = new Decimal(divisor);

    if (decimal.isZero()) {
      return Decimal.MAX_DECIMAL;
    }

    const quotient = increasePrecision(this.value, Decimal.PRECISION) / decimal.value;

    return new Decimal(quotient, Decimal.PRECISION);
  }

  // TODO: it returns wrong result when exponent <= 0
  pow(exponent: number): Decimal {
    const result = this.value ** BigInt(exponent);

    return new Decimal(decreasePrecision(result, exponent * Decimal.PRECISION - Decimal.PRECISION), Decimal.PRECISION);
  }

  abs(): Decimal {
    return new Decimal(abs(this.value), Decimal.PRECISION);
  }

  equals(comparable: Numberish): boolean {
    const decimal = new Decimal(comparable);

    return this.value == decimal.value;
  }

  approximatelyEquals(comparable: Numberish, percentageOffset: Numberish): boolean {
    const decimal = new Decimal(comparable);
    const diff = new Decimal(abs(this.value - decimal.value), Decimal.PRECISION);
    const offset = new Decimal(percentageOffset);

    return diff.div(this.abs()).lte(offset);
  }

  lt(another: Numberish): boolean {
    const decimal = new Decimal(another);

    return this.value < decimal.value;
  }

  lte(another: Numberish): boolean {
    const decimal = new Decimal(another);

    return this.value <= decimal.value;
  }

  gt(another: Numberish): boolean {
    const decimal = new Decimal(another);

    return this.value > decimal.value;
  }

  gte(another: Numberish): boolean {
    const decimal = new Decimal(another);

    return this.value >= decimal.value;
  }

  isZero(): boolean {
    return this.value === 0n;
  }

  toBigInt(precision = Decimal.PRECISION): bigint {
    if (precision === Decimal.PRECISION) {
      return this.value;
    }
    if (Decimal.PRECISION < precision) {
      return increasePrecision(this.value, precision - Decimal.PRECISION);
    }
    return decreasePrecision(this.value, Decimal.PRECISION - precision);
  }

  toString(): string {
    return formatUnits(this.value, Decimal.PRECISION);
  }

  toRounded(fractionDigits = 0): string {
    const str = this.toString();
    const [integral, fraction = ''] = str.split('.');

    const lastDigit = fraction.charAt(fractionDigits);

    if (this.gte(0)) {
      // non-negative number
      if (Number(lastDigit) < 5) {
        // no need to be rounded
        return this.toTruncated(fractionDigits, true);
      }
      if (fractionDigits > 0) {
        // round to fractionDigits decimal places
        const bigNum = parseUnits(`${integral}.${fraction.slice(0, fractionDigits)}`, fractionDigits);
        const strRounded = formatUnits(bigNum + 1n, fractionDigits);
        const [outputIntegral, outputFraction = ''] = strRounded.split('.');
        return `${outputIntegral}.${outputFraction.padEnd(fractionDigits, '0')}`;
      }
      // rounded as integer, simply +1
      return (BigInt(integral) + 1n).toString();
    }
    // negative number
    if (Number(lastDigit) <= 5) {
      // no need to be rounded
      return this.toTruncated(fractionDigits, true);
    }
    if (fractionDigits > 0) {
      // round to fractionDigits decimal places
      const bigNum = parseUnits(`${integral}.${fraction.slice(0, fractionDigits)}`, fractionDigits);
      const strRounded = formatUnits(bigNum - 1n, fractionDigits);
      const [outputIntegral, outputFraction = ''] = strRounded.split('.');
      return `${outputIntegral}.${outputFraction.padEnd(fractionDigits, '0')}`;
    }
    // rounded as negative integer, simply -1
    return (BigInt(integral) - 1n).toString();
  }

  toTruncated(fractionDigits = 0, pad = false): string {
    const str = this.toString();
    const [integral, fraction = ''] = str.split('.');

    if (fractionDigits > 0) {
      if (pad) {
        return `${integral}.${fraction.slice(0, fractionDigits).padEnd(fractionDigits, '0')}`;
      }

      if (fraction.length > 0) {
        return `${integral}.${fraction.slice(0, fractionDigits)}`;
      }
      return integral;
    }
    return integral;
  }
}
