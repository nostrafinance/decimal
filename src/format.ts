import { Decimal, Numberish } from './decimal';

type CommonFormatOptions = {
  fractionDigits?: number;
  round?: boolean;
  pad?: boolean;
  lessThanFormat?: boolean;
  approximate?: boolean;
};

type FormatOptionsVariants =
  | {
      style: 'percentage' | 'decimal';
    }
  | {
      style: 'currency';
      currency: string;
    }
  | {
      style: 'multiplier';
      noMultiplierFractionDigits?: number;
      currency?: string;
    };

type FormatOptions = CommonFormatOptions & FormatOptionsVariants;

const MULTIPLIER_LOOKUP = [
  { numOfDigits: 19, symbol: 'Q' },
  { numOfDigits: 16, symbol: 'q' },
  { numOfDigits: 13, symbol: 'T' },
  { numOfDigits: 10, symbol: 'B' },
  { numOfDigits: 7, symbol: 'M' },
  { numOfDigits: 4, symbol: 'k' },
];

export class DecimalFormat {
  /**
   * Formats the given `Decimal`, `string` or `number` value based on formatting options.
   *
   * @param value The value to format.
   * @param options The formatting options.
   * @param options.style The style used for formatting numbers.
   *        - `'percentage'` - formats the value as a percentage (e.g. `1.23%`).
   *        - `'decimal'` - formats the value as a decimal with digits grouping (`123,456,789.01`).
   *        - `'currency'` - formats the value as a currency (e.g. `$1,234.56`). The currency symbol is taken from the
   *          `options.currency` property. Basically, it's the same as `'decimal'` style, but with a currency symbol.
   *       - `'multiplier'` - formats the value as a multiplier (e.g. `1.23k`).
   * @param options.fractionDigits The number of digits after the decimal point. `0` by default.
   * @param options.round Whether to round the value. `false` by default.
   * @param options.pad Whether to pad the value with trailing zeros. `false` by default.
   * @param options.lessThanFormat Whether to format the value with a less than sign in case when the value is not zero,
   *        but it is formatted as zero (e.g. `0.0001` is formatted as `0.00` when `options.fractionDigits` is set to
   *        `2`—when `options.lessThanFormat` is set to `true`, it changes the format to `<0.01`). `false` by default.
   * @param options.approximate Whether to add the approximate sign (`~`) to the formatted value. `false` by default.
   * @param options.currency The currency symbol to use for formatting. It can be either `'$'` or any of supported
   *        tokens (either underlying or lending/collateral/debt ones). Used only when `options.style` is set to
   *        `'currency'` or `'multiplier'`. Optional for `'multiplier'` style.
   * @param options.noMultiplierFractionDigits The number of digits after the decimal point if the style is set to
   *        `'multiplier'`, but the value is less than 1k. Optional. If not set, it will use `options.fractionDigits`.
   * @returns The formatted value.
   */
  static format(value: Numberish, options: FormatOptions): string {
    const {
      style,
      fractionDigits = 0,
      round = false,
      pad = false,
      lessThanFormat = false,
      approximate = false,
    } = options;
    let formattedValue: string;

    switch (style) {
      case 'multiplier': {
        const formattedMultiplier = this.formatWithMultiplier(
          value,
          fractionDigits,
          options.noMultiplierFractionDigits,
        );
        formattedValue = options.currency
          ? this.formatWithCurrencySymbol(formattedMultiplier, options.currency)
          : formattedMultiplier;
        break;
      }

      case 'percentage':
        formattedValue = this.formatToPercentage(value, fractionDigits, round, pad);
        break;

      case 'decimal':
        formattedValue = this.formatToDecimal(value, fractionDigits);
        break;

      case 'currency': {
        const formattedDecimal = this.formatToDecimal(value, fractionDigits);
        formattedValue = this.formatWithCurrencySymbol(formattedDecimal, options.currency);
        break;
      }
    }

    if (approximate) {
      formattedValue = this.formatWithApproximateSign(formattedValue);
    }

    return lessThanFormat ? this.formatWithLessThanSign(value, formattedValue, options) : formattedValue;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  // round for multiplier (e.g. 9876 -> 9.88k), truncate for fraction (e.g. 9.876 -> 9.87)
  private static formatWithMultiplier(
    value: Numberish,
    multiplierFractionDigits: number,
    noMultiplierFractionDigits?: number,
  ): string {
    const decimal = new Decimal(value);
    const decimalAbs = decimal.abs();
    const integerLength = decimalAbs.toTruncated(0, true).length; // TODO: use toTruncated or toRounded and pad based on options
    const multiplier = MULTIPLIER_LOOKUP.find(item => integerLength >= item.numOfDigits);

    if (multiplier) {
      return `${decimal.div('1'.padEnd(multiplier.numOfDigits, '0')).toTruncated(multiplierFractionDigits, true)}${
        multiplier.symbol
      }`;
    }

    return noMultiplierFractionDigits !== undefined
      ? this.formatToDecimal(value, noMultiplierFractionDigits)
      : decimal.toTruncated(multiplierFractionDigits, true);
  }

  // truncate for currency (e.g. $9,999.876 -> $9,999.87)
  private static formatToDecimal(value: Numberish, fractionDigits: number): string {
    const decimal = new Decimal(value);
    const str = decimal.toTruncated(fractionDigits, true); // TODO: use toTruncated or toRounded and pad based on options
    const [integerPart, fractionalPart] = str.split('.');

    const integerPartReversed = integerPart.split('').reverse().join('');
    const integerPartReversedSplitted = integerPartReversed.match(/.{1,3}/g) as string[];
    const integerPartReversedSeparatorsAdded = integerPartReversedSplitted.join(',');
    const integerPartSeparatorsAdded = integerPartReversedSeparatorsAdded.split('').reverse().join('');

    return fractionDigits > 0 ? `${integerPartSeparatorsAdded}.${fractionalPart}` : integerPartSeparatorsAdded;
  }

  private static formatToPercentage(
    value: Numberish,
    fractionDigits: number,
    roundValue?: boolean,
    pad?: boolean,
  ): string {
    const decimalValue = new Decimal(value);
    const presentValue = decimalValue.mul(100);

    const formattedValue = roundValue
      ? presentValue.toRounded(fractionDigits)
      : presentValue.toTruncated(fractionDigits, pad);

    const [integerPart, fractionalPart = ''] = formattedValue.split('.');
    const integerWithCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return fractionalPart ? `${integerWithCommas}.${fractionalPart}%` : `${integerWithCommas}%`;
  }

  // Additional formatting prefixes and suffixes

  private static formatWithLessThanSign(value: Numberish, formattedValue: string, formatOptions: FormatOptions) {
    const decimalValue = new Decimal(value);

    const zeroFormattedValue = this.format(0, { ...formatOptions, lessThanFormat: false });

    if (!decimalValue.isZero() && formattedValue === zeroFormattedValue) {
      // In case we are adding `<` sign, we do not need approximate `~` sign
      if (formatOptions.approximate) {
        formattedValue = formattedValue.replace('~', '');
      }

      const lastZeroIndex = formattedValue.lastIndexOf('0');
      return `<${formattedValue.slice(0, lastZeroIndex)}1${formattedValue.slice(lastZeroIndex + 1)}`;
    }

    return formattedValue;
  }

  private static formatWithCurrencySymbol(formattedValue: string, currency: string) {
    return currency === '$' ? `${currency}${formattedValue}` : `${formattedValue} ${currency}`;
  }

  private static formatWithApproximateSign(formattedValue: string) {
    return `~${formattedValue}`;
  }
}
