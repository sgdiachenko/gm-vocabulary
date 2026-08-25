import { registerDecorator, ValidationOptions } from 'class-validator';

export function MatchesRule(
  ruleName: string,
  pattern: RegExp,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    registerDecorator({
      name: ruleName,
      target: target.constructor,
      propertyName: propertyKey.toString(),
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return (
            typeof value === 'string' &&
            new RegExp(pattern.source, pattern.flags).test(value)
          );
        },
      },
    });
  };
}
