import { Numberish } from '../src/decimal';
import { DecimalFormat } from '../src/format';

describe('DecimalFormat', () => {
  describe('Multiplier format', () => {
    const cases: {
      value: Numberish;
      fractionDigits?: number;
      noMultiplierFractionDigits?: number;
      currency?: string;
      lessThanFormat?: boolean;
      approximate?: boolean;
      expected: string;
    }[] = [
      { value: 0, expected: '0' },
      { value: 0, fractionDigits: 1, expected: '0.0' },
      { value: 0.0546, fractionDigits: 3, expected: '0.054' },
      { value: '0.000000000056', fractionDigits: 3, expected: '0.000' },
      { value: 0.0546, fractionDigits: 1, expected: '0.0' },
      { value: 12, fractionDigits: 1, expected: '12.0' },
      { value: 1234, fractionDigits: 1, expected: '1.2k' },
      { value: 100000000, fractionDigits: 1, expected: '100.0M' },
      { value: 100000000, fractionDigits: 1, expected: '100.0M' },
      { value: 299792458, fractionDigits: 1, expected: '299.8M' },
      { value: 759878, fractionDigits: 1, expected: '759.9k' },
      { value: 759878, fractionDigits: 0, expected: '760k' },
      { value: 123, fractionDigits: 1, expected: '123.0' },
      { value: 123.456, fractionDigits: 1, expected: '123.4' },
      { value: 123.456, fractionDigits: 2, expected: '123.45' },
      { value: 123.456, fractionDigits: 4, expected: '123.4560' },
      { value: -1000, fractionDigits: 0, expected: '-1k' },
      { value: '0', expected: '0' },
      { value: '0', fractionDigits: 0, expected: '0' },
      { value: '0.0', fractionDigits: 2, expected: '0.00' },
      { value: '0.000000007631', fractionDigits: 2, expected: '0.00' },
      { value: '3.4', fractionDigits: 2, expected: '3.40' },
      { value: '123', fractionDigits: 3, expected: '123.000' },
      { value: '123.45678', fractionDigits: 0, expected: '123' },
      { value: '123.45678', fractionDigits: 2, expected: '123.45' },
      { value: '-123', fractionDigits: 3, expected: '-123.000' },
      { value: '-123.45678', fractionDigits: 0, expected: '-123' },
      { value: '-123.45678', fractionDigits: 2, expected: '-123.45' },
      { value: '7389', expected: '7k' },
      { value: '7389', fractionDigits: 1, expected: '7.4k' },
      { value: '-7389', fractionDigits: 1, expected: '-7.4k' },
      { value: '63427184', fractionDigits: 0, expected: '63M' },
      { value: '63427184', fractionDigits: 2, expected: '63.43M' },
      { value: '-63427184', fractionDigits: 0, expected: '-63M' },
      { value: '-63427184', fractionDigits: 2, expected: '-63.43M' },
      { value: '0', noMultiplierFractionDigits: 1, currency: '$', expected: '$0.0' },
      { value: '0', fractionDigits: 0, noMultiplierFractionDigits: 2, expected: '0.00' },
      { value: '0.0', fractionDigits: 2, expected: '0.00' },
      { value: '0.000000007631', fractionDigits: 2, noMultiplierFractionDigits: 5, expected: '0.00000' },
      { value: '7389', expected: '7k' },
      { value: '7389', fractionDigits: 1, noMultiplierFractionDigits: 3, expected: '7.4k' },
      { value: '-7389', fractionDigits: 1, noMultiplierFractionDigits: 1, expected: '-7.4k' },
      { value: '63427184', fractionDigits: 0, expected: '63M' },
      { value: '63427184', fractionDigits: 2, noMultiplierFractionDigits: 1, currency: 'ETH', expected: '63.43M ETH' },
      { value: '-63427184', fractionDigits: 0, noMultiplierFractionDigits: 3, expected: '-63M' },
      { value: '-63427184', fractionDigits: 2, noMultiplierFractionDigits: 5, expected: '-63.43M' },
      { value: '0', approximate: true, expected: '~0' },
      { value: '0', approximate: true, fractionDigits: 0, expected: '~0' },
      { value: '0.0', fractionDigits: 2, approximate: true, expected: '~0.00' },
      { value: '0.000000007631', fractionDigits: 2, approximate: true, expected: '~0.00' },
      { value: '3.4', fractionDigits: 2, approximate: true, expected: '~3.40' },
      { value: '123', fractionDigits: 3, approximate: true, expected: '~123.000' },
      { value: '123.45678', fractionDigits: 0, approximate: true, expected: '~123' },
      { value: '123.45678', fractionDigits: 2, approximate: true, expected: '~123.45' },
      { value: '-123', fractionDigits: 3, approximate: true, expected: '~-123.000' },
      { value: '-123.45678', fractionDigits: 0, approximate: true, expected: '~-123' },
      { value: '-123.45678', fractionDigits: 2, approximate: true, expected: '~-123.45' },
      { value: '7389', approximate: true, expected: '~7k' },
      { value: '7389', fractionDigits: 1, approximate: true, expected: '~7.4k' },
      { value: '-7389', fractionDigits: 1, approximate: true, expected: '~-7.4k' },
      { value: '63427184', fractionDigits: 0, approximate: true, expected: '~63M' },
      { value: '63427184', fractionDigits: 2, approximate: true, expected: '~63.43M' },
      { value: '-63427184', fractionDigits: 0, approximate: true, expected: '~-63M' },
      { value: '-63427184', fractionDigits: 2, approximate: true, expected: '~-63.43M' },
    ];

    cases.forEach(({ value, fractionDigits, noMultiplierFractionDigits, currency, approximate, expected }) => {
      it(`formats ${value} to ${expected} with ${fractionDigits} fraction digits`, () => {
        expect(
          DecimalFormat.format(value, {
            style: 'multiplier',
            fractionDigits,
            noMultiplierFractionDigits,
            currency,
            approximate,
          }),
        ).toEqual(expected);
      });
    });
  });

  describe('Decimal format', () => {
    const cases: {
      value: Numberish;
      fractionDigits?: number;
      lessThanFormat?: boolean;
      expected: string;
      approximate?: boolean;
    }[] = [
      { value: '0', fractionDigits: 1, expected: '0.0' },
      { value: '0.0', fractionDigits: 1, expected: '0.0' },
      { value: '0.00000123', fractionDigits: 2, lessThanFormat: true, expected: '<0.01' },
      { value: '12', fractionDigits: 1, expected: '12.0' },
      { value: '.12123', fractionDigits: 4, expected: '0.1212' },
      { value: '.12123124', fractionDigits: 3, expected: '0.121' },
      { value: '1234', fractionDigits: 1, expected: '1,234.0' },
      { value: '100000000', fractionDigits: 1, expected: '100,000,000.0' },
      { value: '299792458', fractionDigits: 1, expected: '299,792,458.0' },
      { value: '759878', fractionDigits: 1, expected: '759,878.0' },
      { value: '759878', fractionDigits: 0, expected: '759,878' },
      { value: '123', fractionDigits: 1, expected: '123.0' },
      { value: '123.456', fractionDigits: 1, expected: '123.4' },
      { value: '123.456', fractionDigits: 2, expected: '123.45' },
      { value: '123.456', fractionDigits: 0, expected: '123' },
      { value: '123123', expected: '123,123' },
      { value: '123', expected: '123' },
      { value: '123.4', expected: '123' },
      { value: '123.456', expected: '123' },
      { value: '123.456', fractionDigits: 4, expected: '123.4560' },
      { value: '123.0000000000011', fractionDigits: 1, expected: '123.0' },
      { value: '123.00000000456', expected: '123' },
      { value: '123.0000000045', fractionDigits: 3, expected: '123.000' },
      { value: '0', fractionDigits: 1, approximate: true, expected: '~0.0' },
      { value: '0.0', fractionDigits: 1, approximate: true, expected: '~0.0' },
      { value: '0.00000123', fractionDigits: 2, lessThanFormat: true, approximate: true, expected: '<0.01' },
      { value: '12', fractionDigits: 1, approximate: true, expected: '~12.0' },
      { value: '.12123', fractionDigits: 4, approximate: true, expected: '~0.1212' },
      { value: '.12123124', fractionDigits: 3, approximate: true, expected: '~0.121' },
      { value: '1234', fractionDigits: 1, approximate: true, expected: '~1,234.0' },
      { value: '100000000', fractionDigits: 1, approximate: true, expected: '~100,000,000.0' },
      { value: '299792458', fractionDigits: 1, approximate: true, expected: '~299,792,458.0' },
      { value: '759878', fractionDigits: 1, approximate: true, expected: '~759,878.0' },
      { value: '759878', fractionDigits: 0, approximate: true, expected: '~759,878' },
      { value: '123', fractionDigits: 1, approximate: true, expected: '~123.0' },
      { value: '123.456', fractionDigits: 1, approximate: true, expected: '~123.4' },
      { value: '123.456', fractionDigits: 2, approximate: true, expected: '~123.45' },
      { value: '123.456', fractionDigits: 0, approximate: true, expected: '~123' },
      { value: '123123', approximate: true, expected: '~123,123' },
      { value: '123', approximate: true, expected: '~123' },
      { value: '123.4', approximate: true, expected: '~123' },
      { value: '123.456', approximate: true, expected: '~123' },
      { value: '123.456', approximate: true, fractionDigits: 4, expected: '~123.4560' },
      { value: '123.0000000000011', fractionDigits: 1, approximate: true, expected: '~123.0' },
      { value: '123.00000000456', approximate: true, expected: '~123' },
      { value: '123.0000000045', fractionDigits: 3, approximate: true, expected: '~123.000' },
    ];

    cases.forEach(({ value, fractionDigits, lessThanFormat, approximate, expected }) => {
      it(`formats ${value} to ${expected} with ${fractionDigits} fraction digits`, () => {
        expect(DecimalFormat.format(value, { style: 'decimal', fractionDigits, lessThanFormat, approximate })).toEqual(
          expected,
        );
      });
    });
  });

  describe('Currency format', () => {
    const cases: {
      value: Numberish;
      fractionDigits?: number;
      currency: string;
      lessThanFormat?: boolean;
      expected: string;
      approximate?: boolean;
    }[] = [
      { value: '0', fractionDigits: 1, currency: '$', expected: '$0.0' },
      { value: '0.0', fractionDigits: 1, currency: '$', expected: '$0.0' },
      { value: '0.00000123', fractionDigits: 2, currency: '$', lessThanFormat: true, expected: '<$0.01' },
      { value: '12', fractionDigits: 1, currency: '$', expected: '$12.0' },
      { value: '.12123', fractionDigits: 4, currency: '$', expected: '$0.1212' },
      { value: '.12123124', fractionDigits: 3, currency: '$', expected: '$0.121' },
      { value: '1234', fractionDigits: 1, currency: '$', expected: '$1,234.0' },
      { value: '100000000', fractionDigits: 1, currency: '$', expected: '$100,000,000.0' },
      { value: '299792458', fractionDigits: 1, currency: '$', expected: '$299,792,458.0' },
      { value: '759878', fractionDigits: 1, currency: '$', expected: '$759,878.0' },
      { value: '759878', fractionDigits: 0, currency: '$', expected: '$759,878' },
      { value: '123', fractionDigits: 1, currency: '$', expected: '$123.0' },
      { value: '123.456', fractionDigits: 1, currency: '$', expected: '$123.4' },
      { value: '123.456', fractionDigits: 2, currency: 'ETH', expected: '123.45 ETH' },
      { value: '123.456', fractionDigits: 0, currency: 'DAI', expected: '123 DAI' },
      { value: '123123', currency: '$', expected: '$123,123' },
      { value: '123', currency: '$', expected: '$123' },
      { value: '123.4', currency: 'nUSDC', expected: '123 nUSDC' },
      { value: '123.456', currency: '$', expected: '$123' },
      { value: '123.456', fractionDigits: 4, currency: '$', expected: '$123.4560' },
      { value: '123.0000000000011', fractionDigits: 1, currency: '$', expected: '$123.0' },
      { value: '123.00000000456', currency: 'iWBTC-c', expected: '123 iWBTC-c' },
      { value: '123.0000000045', fractionDigits: 3, currency: '$', expected: '$123.000' },
      { value: '0', fractionDigits: 1, currency: '$', approximate: true, expected: '~$0.0' },
      { value: '0.0', fractionDigits: 1, currency: '$', approximate: true, expected: '~$0.0' },
      {
        value: '0.00000123',
        fractionDigits: 2,
        currency: '$',
        lessThanFormat: true,
        approximate: true,
        expected: '<$0.01',
      },
      { value: '12', fractionDigits: 1, currency: '$', approximate: true, expected: '~$12.0' },
      { value: '.12123', fractionDigits: 4, currency: '$', approximate: true, expected: '~$0.1212' },
      { value: '.12123124', fractionDigits: 3, currency: '$', approximate: true, expected: '~$0.121' },
      { value: '1234', fractionDigits: 1, currency: '$', approximate: true, expected: '~$1,234.0' },
      { value: '100000000', fractionDigits: 1, currency: '$', approximate: true, expected: '~$100,000,000.0' },
      { value: '299792458', fractionDigits: 1, currency: '$', approximate: true, expected: '~$299,792,458.0' },
      { value: '759878', fractionDigits: 1, currency: '$', approximate: true, expected: '~$759,878.0' },
      { value: '759878', fractionDigits: 0, currency: '$', approximate: true, expected: '~$759,878' },
      { value: '123', fractionDigits: 1, currency: '$', approximate: true, expected: '~$123.0' },
      { value: '123.456', fractionDigits: 1, currency: '$', approximate: true, expected: '~$123.4' },
      { value: '123.456', fractionDigits: 2, currency: 'ETH', approximate: true, expected: '~123.45 ETH' },
      { value: '123.456', fractionDigits: 0, currency: 'DAI', approximate: true, expected: '~123 DAI' },
      { value: '123123', currency: '$', approximate: true, expected: '~$123,123' },
      { value: '123', currency: '$', approximate: true, expected: '~$123' },
      { value: '123.4', currency: 'nUSDC', approximate: true, expected: '~123 nUSDC' },
      { value: '123.456', currency: '$', approximate: true, expected: '~$123' },
      { value: '123.456', fractionDigits: 4, currency: '$', approximate: true, expected: '~$123.4560' },
      { value: '123.0000000000011', fractionDigits: 1, currency: '$', approximate: true, expected: '~$123.0' },
      { value: '123.00000000456', currency: 'iWBTC-c', approximate: true, expected: '~123 iWBTC-c' },
      { value: '123.0000000045', fractionDigits: 3, currency: '$', approximate: true, expected: '~$123.000' },
    ];

    cases.forEach(({ value, fractionDigits, currency, lessThanFormat, approximate, expected }) => {
      it(`formats ${value} to ${expected} (currency) with ${fractionDigits} fraction digits`, () => {
        expect(
          DecimalFormat.format(value, { style: 'currency', fractionDigits, lessThanFormat, currency, approximate }),
        ).toEqual(expected);
      });
    });
  });

  describe('Percentage format', () => {
    [
      { value: 0, expected: '0%' },
      { value: 0, fractionDigits: 1, round: true, expected: '0.0%' },
      { value: 0.0546, fractionDigits: 3, round: false, expected: '5.46%' },
      { value: '0.000000000056', fractionDigits: 3, round: false, expected: '0.000%' },
      { value: 0.0546, fractionDigits: 1, round: true, expected: '5.5%' },
      { value: 12, fractionDigits: 1, expected: '1,200%' },
      { value: 1234, fractionDigits: 1, round: false, expected: '123,400%' },
      { value: 100000000, fractionDigits: 1, round: true, expected: '10,000,000,000.0%' },
      { value: 299792458, fractionDigits: 1, round: false, expected: '29,979,245,800%' },
      { value: 759878, fractionDigits: 1, round: false, expected: '75,987,800%' },
      { value: 759878, fractionDigits: 0, round: true, expected: '75,987,800%' },
      { value: 123, fractionDigits: 1, expected: '12,300%' },
      { value: 123.456, fractionDigits: 1, round: false, expected: '12,345.6%' },
      { value: 123.456, fractionDigits: 2, round: true, expected: '12,345.60%' },
      { value: 123.456, fractionDigits: 4, round: false, expected: '12,345.6%' },
      { value: -1000, fractionDigits: 0, expected: '-100,000%' },
      { value: '0', round: true, expected: '0%' },
      { value: '0', fractionDigits: 0, round: false, expected: '0%' },
      { value: '0.0', fractionDigits: 2, round: true, expected: '0.00%' },
      { value: '0.000000007631', fractionDigits: 2, round: false, expected: '0.00%' },
      { value: '0.000000007631', fractionDigits: 2, round: false, lessThanFormat: true, expected: '0.00%' },
      { value: '3.4', fractionDigits: 2, round: true, expected: '340.00%' },
      { value: '123', fractionDigits: 3, expected: '12,300%' },
      { value: '123.45678', fractionDigits: 0, round: false, expected: '12,345%' },
      { value: '123.45678', fractionDigits: 2, round: true, expected: '12,345.68%' },
      { value: '-123', fractionDigits: 3, round: false, expected: '-12,300%' },
      { value: '-123.45678', fractionDigits: 0, expected: '-12,345%' },
      { value: '-123.45678', fractionDigits: 2, round: false, expected: '-12,345.67%' },
      { value: '7389', round: true, expected: '738,900%' },
      { value: '7389', fractionDigits: 1, round: false, expected: '738,900%' },
      { value: '-7389', fractionDigits: 1, round: true, expected: '-738,900.0%' },
      { value: '63427184', fractionDigits: 0, round: false, expected: '6,342,718,400%' },
      { value: '63427184', fractionDigits: 2, expected: '6,342,718,400%' },
      { value: '-63427184', fractionDigits: 0, round: false, expected: '-6,342,718,400%' },
      { value: '-63427184', fractionDigits: 2, expected: '-6,342,718,400%' },
      { value: 0, approximate: true, expected: '~0%' },
      { value: 0, fractionDigits: 1, round: true, approximate: true, expected: '~0.0%' },
      { value: 0.0546, fractionDigits: 3, round: false, approximate: true, expected: '~5.46%' },
      { value: '0.000000000056', fractionDigits: 3, round: false, approximate: true, expected: '~0.000%' },
      { value: 0.0546, fractionDigits: 1, round: true, approximate: true, expected: '~5.5%' },
      { value: 12, fractionDigits: 1, approximate: true, expected: '~1,200%' },
      { value: 1234, fractionDigits: 1, round: false, approximate: true, expected: '~123,400%' },
      { value: 100000000, fractionDigits: 1, round: true, approximate: true, expected: '~10,000,000,000.0%' },
      { value: 299792458, fractionDigits: 1, round: false, approximate: true, expected: '~29,979,245,800%' },
      { value: 759878, fractionDigits: 1, round: false, approximate: true, expected: '~75,987,800%' },
      { value: 759878, fractionDigits: 0, round: true, approximate: true, expected: '~75,987,800%' },
      { value: 123, fractionDigits: 1, approximate: true, expected: '~12,300%' },
      { value: 123.456, fractionDigits: 1, round: false, approximate: true, expected: '~12,345.6%' },
      { value: 123.456, fractionDigits: 2, round: true, approximate: true, expected: '~12,345.60%' },
      { value: 123.456, fractionDigits: 4, round: false, approximate: true, expected: '~12,345.6%' },
      { value: -1000, fractionDigits: 0, approximate: true, expected: '~-100,000%' },
      { value: '0', round: true, approximate: true, expected: '~0%' },
      { value: '0', fractionDigits: 0, round: false, approximate: true, expected: '~0%' },
      { value: '0.0', fractionDigits: 2, round: true, approximate: true, expected: '~0.00%' },
      { value: '0.000000007631', fractionDigits: 2, round: false, approximate: true, expected: '~0.00%' },
      {
        value: '0.000000007631',
        fractionDigits: 2,
        round: false,
        lessThanFormat: true,
        approximate: true,
        expected: '~0.00%',
      },
      { value: '3.4', fractionDigits: 2, round: true, approximate: true, expected: '~340.00%' },
      { value: '123', fractionDigits: 3, approximate: true, expected: '~12,300%' },
      { value: '123.45678', fractionDigits: 0, round: false, approximate: true, expected: '~12,345%' },
      { value: '123.45678', fractionDigits: 2, round: true, approximate: true, expected: '~12,345.68%' },
      { value: '-123', fractionDigits: 3, round: false, approximate: true, expected: '~-12,300%' },
      { value: '-123.45678', fractionDigits: 0, approximate: true, expected: '~-12,345%' },
      { value: '-123.45678', fractionDigits: 2, round: false, approximate: true, expected: '~-12,345.67%' },
      { value: '7389', round: true, approximate: true, expected: '~738,900%' },
      { value: '7389', fractionDigits: 1, round: false, approximate: true, expected: '~738,900%' },
      { value: '-7389', fractionDigits: 1, round: true, approximate: true, expected: '~-738,900.0%' },
      { value: '63427184', fractionDigits: 0, round: false, approximate: true, expected: '~6,342,718,400%' },
      { value: '63427184', fractionDigits: 2, approximate: true, expected: '~6,342,718,400%' },
      { value: '-63427184', fractionDigits: 0, round: false, approximate: true, expected: '~-6,342,718,400%' },
      { value: '-63427184', fractionDigits: 2, approximate: true, expected: '~-6,342,718,400%' },
    ].forEach(({ value, fractionDigits, round, lessThanFormat, expected, approximate }) => {
      it(`formats ${value} to ${expected}`, () => {
        expect(
          DecimalFormat.format(value, { style: 'percentage', fractionDigits, lessThanFormat, round, approximate }),
        ).toEqual(expected);
      });
    });
  });
});
