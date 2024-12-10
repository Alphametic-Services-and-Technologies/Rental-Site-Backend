import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
  validate(
    password: string,
    _validationArguments?: ValidationArguments
  ): Promise<boolean> | boolean {
    // Example validation: At least one uppercase, one lowercase, one number, and one special character
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }

  defaultMessage(_validationArguments?: ValidationArguments): string {
    return 'Password is too weak. It must include at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long.';
  }
}

export default function IsStrongPassword(
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
}
