import parseDurationToMilliseconds from '../../../src/utils/time.js';

describe('Time Utils', () => {
  it('should convert seconds to milliseconds', () => {
    expect(
      parseDurationToMilliseconds('30s')
    ).toBe(30 * 1000);
  });

  it('should convert minutes to milliseconds', () => {
    expect(
      parseDurationToMilliseconds('5m')
    ).toBe(5 * 60 * 1000);
  });

  it('should convert hours to milliseconds', () => {
    expect(
      parseDurationToMilliseconds('2h')
    ).toBe(2 * 60 * 60 * 1000);
  });

  it('should convert days to milliseconds', () => {
    expect(
      parseDurationToMilliseconds('7d')
    ).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('should reject invalid duration format', () => {
    expect(() => {
      parseDurationToMilliseconds('10x');
    }).toThrow(
      'Invalid duration format: 10x'
    );
  });

  it('should reject duration without a numeric value', () => {
    expect(() => {
      parseDurationToMilliseconds('h');
    }).toThrow(
      'Invalid duration format: h'
    );
  });
});