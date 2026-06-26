const strictEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isStrictEmail = (value: string): boolean => strictEmailPattern.test(value);
