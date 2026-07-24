import { describe, expect, test } from 'vitest';
import { hexToRgb, relativeLuminance, contrastRatio, wcagLevel } from './contrast';

describe('hexToRgb', () => {
  test('parses 6-digit hex', () => {
    expect(hexToRgb('#16a34a')).toEqual([22, 163, 74]);
    expect(hexToRgb('#ffffff')).toEqual([255, 255, 255]);
  });

  test('expands 3-digit hex', () => {
    expect(hexToRgb('#000')).toEqual([0, 0, 0]);
    expect(hexToRgb('#0f0')).toEqual([0, 255, 0]);
  });
});

describe('relativeLuminance', () => {
  test('is 1 for white and 0 for black', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1);
    expect(relativeLuminance('#000000')).toBeCloseTo(0);
  });
});

describe('contrastRatio', () => {
  test('black on white is the maximum 21:1', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
  });

  test('is symmetric regardless of argument order', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 0);
  });

  test('same colour is 1:1', () => {
    expect(contrastRatio('#16a34a', '#16a34a')).toBeCloseTo(1);
  });
});

describe('wcagLevel', () => {
  test('grades each band', () => {
    expect(wcagLevel(21)).toBe('AAA');
    expect(wcagLevel(7)).toBe('AAA');
    expect(wcagLevel(4.5)).toBe('AA');
    expect(wcagLevel(3)).toBe('AA Large');
    expect(wcagLevel(2.9)).toBe('Fail');
  });
});
