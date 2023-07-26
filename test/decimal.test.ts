import Decimal from '../src/decimal';
import { formatUnits, parseUnits } from '../src/utils';

describe('Decimal', () => {
  describe('MAX_DECIMAL', () => {
    expect(Decimal.MAX_DECIMAL).toEqual(
      new Decimal(0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn, Decimal.PRECISION),
    );
  });

  describe('constructor', () => {
    [
      {
        value: 123.123,
        expected: 123123000000000000000n,
      },
      {
        value: '123.123',
        expected: 123123000000000000000n,
      },
      {
        value: 123123000000000000000n,
        precisionConvertFrom: 18,
        expected: 123123000000000000000n,
      },
      {
        value: 123123000000000n,
        precisionConvertFrom: 12,
        expected: 123123000000000000000n,
      },
      {
        value: 123123000000000000000000000n,
        precisionConvertFrom: 24,
        expected: 123123000000000000000n,
      },
      {
        value: new Decimal(123.123),
        expected: 123123000000000000000n,
      },
    ].forEach(({ value, precisionConvertFrom, expected }) =>
      it(`accepts number/string/bigint/Decimal: ${value.toString()}`, () => {
        let decimal: Decimal;
        if (typeof value === 'bigint') {
          decimal = new Decimal(value, precisionConvertFrom ?? Decimal.PRECISION);
        } else {
          decimal = new Decimal(value);
        }

        expect(decimal.value).toEqual(expected);
      }),
    );

    [
      { value: '0', expected: 0n },
      { value: '0.0', expected: 0n },
      { value: '.123', expected: 123000000000000000n },
      { value: '123.', expected: 123000000000000000000n },
      { value: '-123', expected: -123000000000000000000n },
      {
        value: '12312412325325123124241252547656785634345234123.1231233243655456645675423443645457',
        expected: 12312412325325123124241252547656785634345234123123123324365545664n,
      },
    ].forEach(({ value, expected }) =>
      it(`accepts value ${value}`, () => {
        const decimal = new Decimal(value);
        const result = new Decimal(expected, Decimal.PRECISION);

        expect(decimal.equals(result)).toBe(true);
      }),
    );

    [{ value: '.' }, { value: '' }, { value: '1e8' }, { value: '123.01234567890.12345678' }].forEach(({ value }) =>
      it(`throw error for accepting ${value}`, () => {
        expect(() => new Decimal(value)).toThrow(`Failed to parse ${value} when creating Decimal`);
      }),
    );
  });

  describe('parse()', () => {
    [
      {
        value: 123.123,
        defaultValue: 789.789,
        expected: 123123000000000000000n,
      },
      {
        value: '123.123',
        defaultValue: 789.789,
        expected: 123123000000000000000n,
      },
      {
        value: 123123000000000000000n,
        defaultValue: 789.789,
        expected: 123123000000000000000n,
      },
      {
        value: new Decimal(123.123),
        defaultValue: 789.789,
        expected: 123123000000000000000n,
      },
      { value: '0', defaultValue: 789.789, expected: 0n },
      { value: '0.0', defaultValue: 789.789, expected: 0n },
      { value: '.123', defaultValue: 789.789, expected: 123000000000000000n },
      { value: '123.', defaultValue: 789.789, expected: 123000000000000000000n },
      { value: '-123', defaultValue: 789.789, expected: -123000000000000000000n },
    ].forEach(({ value, defaultValue, expected }) =>
      it(`it parses ${value.toString()} successfully`, () => {
        let decimal: Decimal;
        if (typeof value === 'bigint') {
          decimal = Decimal.parse(value, 0n, Decimal.PRECISION);
        } else {
          decimal = Decimal.parse(value, defaultValue);
        }

        expect(decimal.value).toEqual(expected);
      }),
    );

    [
      { value: '.', defaultValue: 789.789, expected: 789789000000000000000n },
      { value: '', defaultValue: 789.789, expected: 789789000000000000000n },
      { value: '1e8', defaultValue: 789.789, expected: 789789000000000000000n },
      { value: '123.01234567890.12345678', defaultValue: 789.789, expected: 789789000000000000000n },
      { value: '.', expected: 0n },
      { value: '', expected: 0n },
      { value: '1e8', expected: 0n },
      { value: '123.01234567890.12345678', expected: 0n },
    ].forEach(({ value, defaultValue, expected }) =>
      it(`it fails to parse ${value} and use default values`, () => {
        const decimal = Decimal.parse(value, defaultValue ?? 0);

        expect(decimal.value).toEqual(expected);
      }),
    );
  });

  describe('max()', () => {
    [
      { a: 123.123, b: 12.12, expected: 123.123 },
      { a: 123.123, b: 123.123, expected: 123.123 },
      { a: 123.123, b: 1234.1234, expected: 1234.1234 },
    ].forEach(({ a, b, expected }) =>
      it(`max of ${a} and ${b} should be ${expected}`, () => {
        const decimalA = new Decimal(a);
        const decimalB = new Decimal(b);

        expect(Decimal.max(decimalA, decimalB)).toEqual(new Decimal(expected));
      }),
    );

    for (let i = 0; i < 10; i++) {
      const a = Math.random() * 1000;
      const b = Math.random() * 1000;
      const expected = Math.max(a, b);

      it(`max of ${a} and ${b} should be ${expected}`, () => {
        const decimalA = new Decimal(a);
        const decimalB = new Decimal(b);

        expect(Decimal.max(decimalA, decimalB)).toEqual(new Decimal(expected));
      });
    }
  });

  describe('min()', () => {
    [
      { a: 123.123, b: 12.12, expected: 12.12 },
      { a: 123.123, b: 123.123, expected: 123.123 },
      { a: 123.123, b: 1234.1234, expected: 123.123 },
    ].forEach(({ a, b, expected }) =>
      it(`min of ${a} and ${b} should be ${expected}`, () => {
        const decimalA = new Decimal(a);
        const decimalB = new Decimal(b);

        expect(Decimal.min(decimalA, decimalB)).toEqual(new Decimal(expected));
      }),
    );

    for (let i = 0; i < 10; i++) {
      const a = Math.random() * 1000;
      const b = Math.random() * 1000;
      const expected = Math.min(a, b);

      it(`min of ${a} and ${b} should be ${expected}`, () => {
        const decimalA = new Decimal(a);
        const decimalB = new Decimal(b);

        expect(Decimal.min(decimalA, decimalB)).toEqual(new Decimal(expected));
      });
    }
  });

  describe('add()', () => {
    [
      { value: 123.123, addend: 12.12, expected: 135.243 },
      { value: 123.123, addend: '12.12', expected: 135.243 },
      { value: 123.123, addend: new Decimal(12.12), expected: 135.243 },
      { value: 123.123, addend: 12.12, expected: 135.243, precision: 10 },
      { value: 9876.1234, addend: '1234.9876', expected: 11111.111 },
      { value: 9876.1234, addend: new Decimal(1234.9876), expected: 11111.111 },
      { value: -123.123, addend: 12.12, expected: -111.003 },
      { value: -123.123, addend: '12.12', expected: -111.003 },
      { value: -123.123, addend: new Decimal(12.12), expected: -111.003 },
    ].forEach(({ value, addend, expected }) =>
      it(`${value} + ${addend} should be ${expected}`, () => {
        const decimal = new Decimal(value);
        const result = new Decimal(expected);

        expect(decimal.add(addend).equals(result)).toBe(true);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 1000;
      const addend = Math.random() * 1000;
      const expected = parseUnits(`${value}`, 18) + parseUnits(`${addend}`, 18);

      it(`${value} + ${addend} should be ${formatUnits(expected, 18)}`, () => {
        const decimal = new Decimal(value);
        const result = new Decimal(expected, Decimal.PRECISION);

        expect(decimal.add(addend).equals(result)).toBe(true);
      });
    }
  });

  describe('sub()', () => {
    [
      { value: 123.123, subtrahend: 12.12, expected: 111.003 },
      { value: 123.123, subtrahend: '12.12', expected: 111.003 },
      { value: 123.123, subtrahend: new Decimal(12.12), expected: 111.003 },
      { value: 9876.1234, subtrahend: 1234.9876, expected: 8641.1358 },
      { value: 9876.1234, subtrahend: '1234.9876', expected: 8641.1358 },
      { value: 9876.1234, subtrahend: new Decimal(1234.9876), expected: 8641.1358 },
      { value: -123.123, subtrahend: 12.12, expected: -135.243 },
      { value: -123.123, subtrahend: '12.12', expected: -135.243 },
      { value: -123.123, subtrahend: new Decimal(12.12), expected: -135.243 },
    ].forEach(({ value, subtrahend, expected }) =>
      it(`${value} - ${subtrahend} should be ${expected}`, () => {
        const decimal = new Decimal(value);
        const result = new Decimal(expected);

        expect(decimal.sub(subtrahend).equals(result)).toBe(true);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 1000;
      const subtrahend = Math.random() * 1000;
      const expected = parseUnits(`${value}`, 18) - parseUnits(`${subtrahend}`, 18);

      it(`${value} - ${subtrahend} should be ${formatUnits(BigInt(expected), 18)}`, () => {
        const decimal = new Decimal(value);
        const result = new Decimal(expected, Decimal.PRECISION);

        expect(decimal.sub(subtrahend).equals(result)).toBe(true);
      });
    }
  });

  describe('mul()', () => {
    [
      { value: 123.123, multiplicand: 12.12, expected: 1492.25076 },
      { value: 123.123, multiplicand: '12.12', expected: 1492.25076 },
      { value: 123.123, multiplicand: new Decimal(12.12), expected: 1492.25076 },
      { value: 9876.1234, multiplicand: 1234.9876, expected: '12196889.93506984' },
      { value: 9876.1234, multiplicand: '1234.9876', expected: '12196889.93506984' },
      { value: 9876.1234, multiplicand: new Decimal(1234.9876), expected: '12196889.93506984' },
      { value: -123.123, multiplicand: 12.12, expected: -1492.25076 },
      { value: -123.123, multiplicand: '12.12', expected: -1492.25076 },
      { value: -123.123, multiplicand: new Decimal(12.12), expected: -1492.25076 },
      { value: 123.123, multiplicand: -12.12, expected: -1492.25076 },
      { value: 123.123, multiplicand: '-12.12', expected: -1492.25076 },
      { value: 123.123, multiplicand: new Decimal(-12.12), expected: -1492.25076 },
      { value: -123.123, multiplicand: -12.12, expected: 1492.25076 },
      { value: -123.123, multiplicand: '-12.12', expected: 1492.25076 },
      { value: -123.123, multiplicand: new Decimal(-12.12), expected: 1492.25076 },
    ].forEach(({ value, multiplicand, expected }) =>
      it(`${value} * ${multiplicand} should be ${expected}`, () => {
        const decimal = new Decimal(value);
        const result = new Decimal(expected);

        expect(decimal.mul(multiplicand).equals(result)).toBe(true);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 1000;
      const multiplicand = Math.random() * 100;
      const expected = (parseUnits(`${value}`, 18) * parseUnits(`${multiplicand}`, 18)) / 10n ** 18n;

      it(`${value} * ${multiplicand} should be ${formatUnits(expected, 18)}`, () => {
        const decimal = new Decimal(value);
        const result = new Decimal(expected, Decimal.PRECISION);

        expect(decimal.mul(multiplicand).equals(result)).toBe(true);
      });
    }
  });

  describe('div()', () => {
    [
      { value: 123.123, divisor: 12.12, expected: '10.158663366336633663' },
      { value: 123.123, divisor: '12.12', expected: '10.158663366336633663' },
      { value: 123.123, divisor: new Decimal(12.12), expected: '10.158663366336633663' },
      { value: 9876.1234, divisor: 1234.9876, expected: '7.996941345807844548' },
      { value: 9876.1234, divisor: '1234.9876', expected: '7.996941345807844548' },
      { value: 9876.1234, divisor: new Decimal(1234.9876), expected: '7.996941345807844548' },
      { value: -123.123, divisor: 12.12, expected: '-10.158663366336633663' },
      { value: -123.123, divisor: '12.12', expected: '-10.158663366336633663' },
      { value: -123.123, divisor: new Decimal(12.12), expected: '-10.158663366336633663' },
      { value: 123.123, divisor: -12.12, expected: '-10.158663366336633663' },
      { value: 123.123, divisor: '-12.12', expected: '-10.158663366336633663' },
      { value: 123.123, divisor: new Decimal(-12.12), expected: '-10.158663366336633663' },
      { value: -123.123, divisor: -12.12, expected: '10.158663366336633663' },
      { value: -123.123, divisor: '-12.12', expected: '10.158663366336633663' },
      { value: -123.123, divisor: new Decimal(-12.12), expected: '10.158663366336633663' },
    ].forEach(({ value, divisor, expected }) =>
      it(`${value} / ${divisor} should be ${expected}`, () => {
        const decimal = new Decimal(value);
        const result = new Decimal(expected);

        expect(decimal.div(divisor).equals(result)).toBe(true);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 1000;
      const divisor = Math.random() * 100 + 1;
      const expected = (parseUnits(`${value}`, 18) * 10n ** 18n) / parseUnits(`${divisor}`, 18);

      it(`${value} / ${divisor} should be ${formatUnits(expected, 18)}`, () => {
        const decimal = new Decimal(value);
        const result = new Decimal(expected, Decimal.PRECISION);

        expect(decimal.div(divisor).equals(result)).toEqual(true);
      });
    }
  });

  describe('pow()', () => {
    [
      // { value: 2, exponent: -1, expected: '0.5' },
      { value: 2, exponent: 0, expected: '1' },
      { value: 2, exponent: 1, expected: '2' },
      { value: 2, exponent: 2, expected: '4' },
      { value: 2, exponent: 3, expected: '8' },
    ].forEach(({ value, exponent, expected }) =>
      it(`value of ${value}^${exponent} should be ${expected}`, () => {
        const decimal = new Decimal(value);
        const result = new Decimal(expected);

        expect(decimal.pow(exponent).equals(result)).toBe(true);
      }),
    );
  });

  describe('abs()', () => {
    [
      { value: 123.123, expected: '123.123' },
      { value: '123.123', expected: '123.123' },
      { value: new Decimal(123.123), expected: '123.123' },
      { value: -123.123, expected: '123.123' },
      { value: '-123.123', expected: '123.123' },
      { value: new Decimal(-123.123), expected: '123.123' },
    ].forEach(({ value, expected }) =>
      it(`abs value of ${value} should be ${expected}`, () => {
        const decimal = new Decimal(value);
        const result = new Decimal(expected);

        expect(decimal.abs().equals(result)).toBe(true);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const minuend = Math.random() * 100;
      const subtrahend = Math.random() * 200;
      const value = minuend - subtrahend;
      const expected = Math.abs(value);

      it(`abs value of ${value} should be ${expected}`, () => {
        const decimal = new Decimal(value);
        const result = new Decimal(expected);

        expect(decimal.abs().equals(result)).toBe(true);
      });
    }
  });

  describe('eq()', () => {
    [
      { value: 123.123, another: 123, expected: false },
      { value: 123.123, another: '123', expected: false },
      { value: 123.123, another: new Decimal(123), expected: false },
      { value: 123.123, another: 123.123, expected: true },
      { value: 123.123, another: '123.123', expected: true },
      { value: 123.123, another: new Decimal(123.123), expected: true },
      { value: 123.123, another: 124, expected: false },
      { value: 123.123, another: '124', expected: false },
      { value: 123.123, another: new Decimal(124), expected: false },
      { value: -123.123, another: -123, expected: false },
      { value: -123.123, another: '-123', expected: false },
      { value: -123.123, another: new Decimal(-123), expected: false },
      { value: -123.123, another: -123.123, expected: true },
      { value: -123.123, another: '-123.123', expected: true },
      { value: -123.123, another: new Decimal(-123.123), expected: true },
      { value: -123.123, another: -124, expected: false },
      { value: -123.123, another: '-124', expected: false },
      { value: -123.123, another: new Decimal(-124), expected: false },
    ].forEach(({ value, another, expected }) =>
      it(`${value} should ${expected ? '' : 'not'} be equal to ${another}`, () => {
        const decimal = new Decimal(value);
        const anotherDecimal = new Decimal(another);

        expect(decimal.equals(anotherDecimal)).toEqual(expected);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 100;
      const another = Math.random() * 100;
      const expected = value === another;

      it(`${value} should ${expected ? '' : 'not'} be equal to ${another}`, () => {
        const decimal = new Decimal(value);
        const anotherDecimal = new Decimal(another);

        expect(decimal.equals(anotherDecimal)).toEqual(expected);
      });
    }
  });

  describe('approximatelyEquals()', () => {
    [
      { value: 123.123, another: 123, offset: 0.01, expected: true },
      { value: 123.123, another: '123', offset: 0.01, expected: true },
      { value: 123.123, another: new Decimal(123), offset: 0.01, expected: true },
      { value: 123.123, another: 123.123, offset: 0.01, expected: true },
      { value: 123.123, another: '123.123', offset: 0.01, expected: true },
      { value: 123.123, another: new Decimal(123.123), offset: 0.01, expected: true },
      { value: 123.123, another: 124, offset: 0.001, expected: false },
      { value: 123.123, another: '124', offset: 0.001, expected: false },
      { value: 123.123, another: new Decimal(124), offset: 0.001, expected: false },
      { value: -123.123, another: -123, offset: 0.01, expected: true },
      { value: -123.123, another: '-123', offset: 0.01, expected: true },
      { value: -123.123, another: new Decimal(-123), offset: 0.01, expected: true },
      { value: -123.123, another: -123.123, offset: 0.01, expected: true },
      { value: -123.123, another: '-123.123', offset: 0.01, expected: true },
      { value: -123.123, another: new Decimal(-123.123), offset: 0.01, expected: true },
      { value: -123.123, another: -124, offset: 0.001, expected: false },
      { value: -123.123, another: '-124', offset: 0.001, expected: false },
      { value: -123.123, another: new Decimal(-124), offset: 0.001, expected: false },
    ].forEach(({ value, another, offset, expected }) =>
      it(`${value} should ${expected ? '' : 'not'} be approximately equal to ${another}`, () => {
        const decimal = new Decimal(value);
        const anotherDecimal = new Decimal(another);

        expect(decimal.approximatelyEquals(anotherDecimal, offset)).toEqual(expected);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 100;
      const another = Math.random() * 100;
      const expected = value === another;

      it(`${value} should ${expected ? '' : 'not'} be equal to ${another}`, () => {
        const decimal = new Decimal(value);
        const anotherDecimal = new Decimal(another);

        expect(decimal.equals(anotherDecimal)).toEqual(expected);
      });
    }
  });

  describe('lt()', () => {
    [
      { value: 123.123, another: 123, expected: false },
      { value: 123.123, another: '123', expected: false },
      { value: 123.123, another: new Decimal(123), expected: false },
      { value: 123.123, another: 123.123, expected: false },
      { value: 123.123, another: '123.123', expected: false },
      { value: 123.123, another: new Decimal(123.123), expected: false },
      { value: 123.123, another: 124, expected: true },
      { value: 123.123, another: '124', expected: true },
      { value: 123.123, another: new Decimal(124), expected: true },
      { value: -123.123, another: -123, expected: true },
      { value: -123.123, another: '-123', expected: true },
      { value: -123.123, another: new Decimal(-123), expected: true },
      { value: -123.123, another: -123.123, expected: false },
      { value: -123.123, another: '-123.123', expected: false },
      { value: -123.123, another: new Decimal(-123.123), expected: false },
      { value: -123.123, another: -124, expected: false },
      { value: -123.123, another: '-124', expected: false },
      { value: -123.123, another: new Decimal(-124), expected: false },
    ].forEach(({ value, another, expected }) =>
      it(`${value} should ${expected ? '' : 'not'} be less than ${another}`, () => {
        const decimal = new Decimal(value);
        const anotherDecimal = new Decimal(another);

        expect(decimal.lt(anotherDecimal)).toEqual(expected);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 100;
      const another = Math.random() * 100;
      const expected = value < another;

      it(`${value} should ${expected ? '' : 'not'} be less than ${another}`, () => {
        const decimal = new Decimal(value);
        const anotherDecimal = new Decimal(another);

        expect(decimal.lt(anotherDecimal)).toEqual(expected);
      });
    }
  });

  describe('lte()', () => {
    [
      { value: 123.123, another: 123, expected: false },
      { value: 123.123, another: '123', expected: false },
      { value: 123.123, another: new Decimal(123), expected: false },
      { value: 123.123, another: 123.123, expected: true },
      { value: 123.123, another: '123.123', expected: true },
      { value: 123.123, another: new Decimal(123.123), expected: true },
      { value: 123.123, another: 124, expected: true },
      { value: 123.123, another: '124', expected: true },
      { value: 123.123, another: new Decimal(124), expected: true },
      { value: -123.123, another: -123, expected: true },
      { value: -123.123, another: '-123', expected: true },
      { value: -123.123, another: new Decimal(-123), expected: true },
      { value: -123.123, another: -123.123, expected: true },
      { value: -123.123, another: '-123.123', expected: true },
      { value: -123.123, another: new Decimal(-123.123), expected: true },
      { value: -123.123, another: -124, expected: false },
      { value: -123.123, another: '-124', expected: false },
      { value: -123.123, another: new Decimal(-124), expected: false },
    ].forEach(({ value, another, expected }) =>
      it(`${value} should ${expected ? '' : 'not'} be less than or equal to ${another}`, () => {
        const decimal = new Decimal(value);
        const anotherDecimal = new Decimal(another);

        expect(decimal.lte(anotherDecimal)).toEqual(expected);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 100;
      const another = Math.random() * 100;
      const expected = value <= another;

      it(`${value} should ${expected ? '' : 'not'} be less than or equal to ${another}`, () => {
        const decimal = new Decimal(value);
        const anotherDecimal = new Decimal(another);

        expect(decimal.lte(anotherDecimal)).toEqual(expected);
      });
    }
  });

  describe('gt()', () => {
    [
      { value: 123.123, another: 123, expected: true },
      { value: 123.123, another: '123', expected: true },
      { value: 123.123, another: new Decimal(123), expected: true },
      { value: 123.123, another: 123.123, expected: false },
      { value: 123.123, another: '123.123', expected: false },
      { value: 123.123, another: new Decimal(123.123), expected: false },
      { value: 123.123, another: 124, expected: false },
      { value: 123.123, another: '124', expected: false },
      { value: 123.123, another: new Decimal(124), expected: false },
      { value: -123.123, another: -123, expected: false },
      { value: -123.123, another: '-123', expected: false },
      { value: -123.123, another: new Decimal(-123), expected: false },
      { value: -123.123, another: -123.123, expected: false },
      { value: -123.123, another: '-123.123', expected: false },
      { value: -123.123, another: new Decimal(-123.123), expected: false },
      { value: -123.123, another: -124, expected: true },
      { value: -123.123, another: '-124', expected: true },
      { value: -123.123, another: new Decimal(-124), expected: true },
    ].forEach(({ value, another, expected }) =>
      it(`${value} should ${expected ? '' : 'not'} be greater than ${another}`, () => {
        const decimal = new Decimal(value);
        const anotherDecimal = new Decimal(another);

        expect(decimal.gt(anotherDecimal)).toEqual(expected);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 100;
      const another = Math.random() * 100;
      const expected = value > another;

      it(`${value} should ${expected ? '' : 'not'} be greater than ${another}`, () => {
        const decimal = new Decimal(value);
        const anotherDecimal = new Decimal(another);

        expect(decimal.gt(anotherDecimal)).toEqual(expected);
      });
    }
  });

  describe('gte()', () => {
    [
      { value: 123.123, another: 123, expected: true },
      { value: 123.123, another: '123', expected: true },
      { value: 123.123, another: new Decimal(123), expected: true },
      { value: 123.123, another: 123.123, expected: true },
      { value: 123.123, another: '123.123', expected: true },
      { value: 123.123, another: new Decimal(123.123), expected: true },
      { value: 123.123, another: 124, expected: false },
      { value: 123.123, another: '124', expected: false },
      { value: 123.123, another: new Decimal(124), expected: false },
      { value: -123.123, another: -123, expected: false },
      { value: -123.123, another: '-123', expected: false },
      { value: -123.123, another: new Decimal(-123), expected: false },
      { value: -123.123, another: -123.123, expected: true },
      { value: -123.123, another: '-123.123', expected: true },
      { value: -123.123, another: new Decimal(-123.123), expected: true },
      { value: -123.123, another: -124, expected: true },
      { value: -123.123, another: '-124', expected: true },
      { value: -123.123, another: new Decimal(-124), expected: true },
    ].forEach(({ value, another, expected }) =>
      it(`${value} should ${expected ? '' : 'not'} be greater than or equal to ${another}`, () => {
        const decimal = new Decimal(value);
        const anotherDecimal = new Decimal(another);

        expect(decimal.gte(anotherDecimal)).toEqual(expected);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 100;
      const another = Math.random() * 100;
      const expected = value >= another;

      it(`${value} should ${expected ? '' : 'not'} be greater than or equal to ${another}`, () => {
        const decimal = new Decimal(value);
        const anotherDecimal = new Decimal(another);

        expect(decimal.gte(anotherDecimal)).toEqual(expected);
      });
    }
  });

  describe('isZero()', () => {
    [
      { value: 0, expected: true },
      { value: '0', expected: true },
      { value: new Decimal(0), expected: true },
      { value: 123.123, expected: false },
      { value: '123.123', expected: false },
      { value: new Decimal(123.123), expected: false },
      { value: -123.123, expected: false },
      { value: '-123.123', expected: false },
      { value: new Decimal(-123.123), expected: false },
    ].forEach(({ value, expected }) =>
      it(`${value} should ${expected ? '' : 'not'} be zero`, () => {
        const decimal = new Decimal(value);

        expect(decimal.isZero()).toEqual(expected);
      }),
    );
  });

  describe('toBigInt()', () => {
    [
      {
        value: 123.123,
        precision: 10,
        expected: 1231230000000n,
      },
      {
        value: 123.123,
        precision: 6,
        expected: 123123000n,
      },
      {
        value: 123.123,
        precision: 18,
        expected: 123123000000000000000n,
      },
      {
        value: 123.123,
        precision: 20,
        expected: 12312300000000000000000n,
      },
      {
        value: 123.123,
        precision: undefined,
        expected: 123123000000000000000n,
      },
      {
        value: -123.123,
        precision: 10,
        expected: -1231230000000n,
      },
      {
        value: -123.123,
        precision: 6,
        expected: -123123000n,
      },
      {
        value: -123.123,
        precision: 18,
        expected: -123123000000000000000n,
      },
      {
        value: -123.123,
        precision: 20,
        expected: -12312300000000000000000n,
      },
      {
        value: -123.123,
        precision: undefined,
        expected: -123123000000000000000n,
      },
    ].forEach(({ value, precision, expected }) =>
      it(`with precision ${precision}`, () => {
        const decimal = new Decimal(value);

        expect(decimal.toBigInt(precision)).toEqual(expected);
      }),
    );
  });

  describe('toString()', () => {
    [
      {
        value: 123.123,
        expected: '123.123',
      },
      {
        value: 123123,
        expected: '123123',
      },
      {
        value: 789.789,
        expected: '789.789',
      },
      {
        value: 789789,
        expected: '789789',
      },
      {
        value: 0.123789,
        expected: '0.123789',
      },
      {
        value: -123.123,
        expected: '-123.123',
      },
      {
        value: -123123,
        expected: '-123123',
      },
      {
        value: -789.789,
        expected: '-789.789',
      },
      {
        value: -789789,
        expected: '-789789',
      },
      {
        value: -0.123789,
        expected: '-0.123789',
      },
    ].forEach(({ value, expected }) =>
      it(`${value} should be converted to ${expected}`, () => {
        const decimal = new Decimal(value);

        expect(decimal.toString()).toEqual(expected);
      }),
    );
  });

  describe('toRounded()', () => {
    [
      {
        value: 100,
        fractionDigits: 2,
        expected: '100.00',
      },
      {
        value: 100,
        fractionDigits: undefined,
        expected: '100',
      },
      {
        value: 123.123,
        fractionDigits: 2,
        expected: '123.12',
      },
      {
        value: 123.123,
        fractionDigits: undefined,
        expected: '123',
      },
      {
        value: 555.555,
        fractionDigits: 2,
        expected: '555.56',
      },
      {
        value: 789.789,
        fractionDigits: 2,
        expected: '789.79',
      },
      {
        value: 789.789,
        fractionDigits: undefined,
        expected: '790',
      },
      {
        value: '123.012345678901234567',
        fractionDigits: 15,
        expected: '123.012345678901235',
      },
      {
        value: '123.012345678901234567',
        fractionDigits: 17,
        expected: '123.01234567890123457',
      },
      {
        value: '123.012345678901234567',
        fractionDigits: 18,
        expected: '123.012345678901234567',
      },
      {
        value: '123.012345678901234567',
        fractionDigits: 20,
        expected: '123.01234567890123456700',
      },
      {
        value: -100,
        fractionDigits: 2,
        expected: '-100.00',
      },
      {
        value: -100,
        fractionDigits: undefined,
        expected: '-100',
      },
      {
        value: -123.123,
        fractionDigits: 2,
        expected: '-123.12',
      },
      {
        value: -123.123,
        fractionDigits: undefined,
        expected: '-123',
      },
      {
        value: -555.555,
        fractionDigits: 2,
        expected: '-555.55',
      },
      {
        value: -789.789,
        fractionDigits: 2,
        expected: '-789.79',
      },
      {
        value: -789.789,
        fractionDigits: undefined,
        expected: '-790',
      },
      {
        value: '-123.012345678901234567',
        fractionDigits: 15,
        expected: '-123.012345678901234',
      },
      {
        value: '-123.012345678901234567',
        fractionDigits: 17,
        expected: '-123.01234567890123457',
      },
      {
        value: '-123.012345678901234567',
        fractionDigits: 18,
        expected: '-123.012345678901234567',
      },
      {
        value: '-123.012345678901234567',
        fractionDigits: 20,
        expected: '-123.01234567890123456700',
      },
      {
        value: '3.999',
        fractionDigits: 2,
        expected: '4.00',
      },
      {
        value: '-3.999',
        fractionDigits: 2,
        expected: '-4.00',
      },
    ].forEach(({ value, fractionDigits, expected }) =>
      it(`${value} should be rounded to ${expected}`, () => {
        const decimal = new Decimal(value);

        expect(decimal.toRounded(fractionDigits)).toEqual(expected);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 1000;
      const fractionDigits = Math.ceil(Math.random() * 5);
      const rounded = Math.round(value * Math.pow(10, fractionDigits)) / Math.pow(10, fractionDigits);

      it(`${value} should be rounded to ${rounded} with fraction digits ${fractionDigits}`, () => {
        const decimal = new Decimal(value);
        const [integral, fraction = ''] = `${rounded}`.split('.');
        const expected = `${integral}.${fraction.padEnd(fractionDigits, '0')}`;

        expect(decimal.toRounded(fractionDigits)).toEqual(expected);
      });
    }
  });

  describe('toTruncated()', () => {
    [
      {
        value: 100,
        fractionDigits: 2,
        expected: '100.00',
        pad: true,
      },
      {
        value: 100,
        fractionDigits: undefined,
        expected: '100',
        pad: true,
      },
      {
        value: 123.123,
        fractionDigits: 2,
        expected: '123.12',
        pad: true,
      },
      {
        value: 123.123,
        fractionDigits: undefined,
        expected: '123',
        pad: true,
      },
      {
        value: 789.789,
        fractionDigits: 2,
        expected: '789.78',
        pad: true,
      },
      {
        value: 789.789,
        fractionDigits: undefined,
        expected: '789',
        pad: true,
      },
      {
        value: '123.012345678901234567',
        fractionDigits: 17,
        expected: '123.01234567890123456',
        pad: true,
      },
      {
        value: '123.012345678901234567',
        fractionDigits: 18,
        expected: '123.012345678901234567',
        pad: true,
      },
      {
        value: '123.012345678901234567',
        fractionDigits: 20,
        expected: '123.01234567890123456700',
        pad: true,
      },
      {
        value: -100,
        fractionDigits: 2,
        expected: '-100.00',
        pad: true,
      },
      {
        value: -100,
        fractionDigits: undefined,
        expected: '-100',
        pad: true,
      },
      {
        value: -123.123,
        fractionDigits: 2,
        expected: '-123.12',
        pad: true,
      },
      {
        value: -123.123,
        fractionDigits: undefined,
        expected: '-123',
        pad: true,
      },
      {
        value: -789.789,
        fractionDigits: 2,
        expected: '-789.78',
        pad: true,
      },
      {
        value: -789.789,
        fractionDigits: undefined,
        expected: '-789',
        pad: true,
      },
      {
        value: '-123.012345678901234567',
        fractionDigits: 17,
        expected: '-123.01234567890123456',
        pad: true,
      },
      {
        value: '-123.012345678901234567',
        fractionDigits: 18,
        expected: '-123.012345678901234567',
        pad: true,
      },
      {
        value: '-123.012345678901234567',
        fractionDigits: 20,
        expected: '-123.01234567890123456700',
        pad: true,
      },
      {
        value: '123',
        fractionDigits: 4,
        expected: '123',
        pad: false,
      },
      {
        value: '123.2345',
        fractionDigits: 6,
        expected: '123.2345',
        pad: false,
      },
      {
        value: '123.23450008',
        fractionDigits: 6,
        expected: '123.234500',
        pad: false,
      },
    ].forEach(({ value, fractionDigits, expected, pad }) =>
      it(`${value} should be truncated to ${expected}`, () => {
        const decimal = new Decimal(value);

        expect(decimal.toTruncated(fractionDigits, pad)).toEqual(expected);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 1000;
      const fractionDigits = Math.ceil(Math.random() * 5);
      const truncated = Math.trunc(value * Math.pow(10, fractionDigits)) / Math.pow(10, fractionDigits);

      it(`${value} should be truncated to ${truncated}`, () => {
        const decimal = new Decimal(value);
        const [integral, fraction = ''] = `${truncated}`.split('.');
        const expected = `${integral}.${fraction.padEnd(fractionDigits, '0')}`;

        expect(decimal.toTruncated(fractionDigits, true)).toEqual(expected);
      });
    }
  });
});
