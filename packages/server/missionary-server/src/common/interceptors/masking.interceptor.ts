import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class MaskingInterceptor implements NestInterceptor {
  private readonly PII_FIELDS = [
    'phoneNumber',
    'identityNumber',
    'bankAccount',
  ];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userRole: UserRole | undefined = request?.user?.role;

    return next.handle().pipe(
      map((data) => {
        const skipFields = this.getSkipFields(userRole, data);
        return this.maskData(data, skipFields);
      }),
    );
  }

  private getSkipFields(
    userRole: UserRole | undefined,
    data: any,
  ): Set<string> {
    const skipFields = new Set<string>();

    if (userRole === UserRole.ADMIN && !Array.isArray(data)) {
      skipFields.add('identityNumber');
      skipFields.add('phoneNumber');
    }

    return skipFields;
  }

  private maskData(data: any, skipFields: Set<string>): any {
    if (!data) {
      return data;
    }

    if (data instanceof Date) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.maskData(item, skipFields));
    }

    if (typeof data === 'object') {
      const masked = { ...data };

      for (const key in masked) {
        if (this.PII_FIELDS.includes(key)) {
          if (skipFields.has(key)) {
            continue;
          }
          masked[key] = this.maskLast6Chars(masked[key]);
        } else if (typeof masked[key] === 'object') {
          masked[key] = this.maskData(masked[key], skipFields);
        }
      }

      return masked;
    }

    return data;
  }

  private maskLast6Chars(value: any): string {
    if (!value || value.length <= 6) {
      return '******';
    }

    return value.slice(0, -6) + '******';
  }
}
