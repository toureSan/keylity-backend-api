import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof BadRequestException) {
          console.error('❌ [ValidationInterceptor] Erreur de validation:', error.message);
          console.error('❌ [ValidationInterceptor] Détails:', error.getResponse());
        }
        return throwError(() => error);
      }),
    );
  }
}
