/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class RequiredHeadersGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // 👀 You MUST see this log in your terminal on every request
    console.log('>>> RequiredHeadersGuard running. Headers:', request.headers);

    const headers = request.headers as Record<string, string | string[]>;

    // ⚠ Header names are LOWERCASE in Node.js
    const platform = headers['platform'];
    const acceptLanguage = headers['accept-language'];
    const subscriptionKey = headers['ocp-apim-subscription-key'];

    const missing: string[] = [];
    if (!platform) missing.push('Platform');
    if (!acceptLanguage) missing.push('Accept-Language');
    if (!subscriptionKey) missing.push('Ocp-Apim-Subscription-Key');

    if (missing.length > 0) {
      throw new BadRequestException(
        `Missing required headers: ${missing.join(', ')}`,
      );
    }

    return true;
  }
}
