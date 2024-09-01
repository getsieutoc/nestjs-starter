import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Type,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { Keys } from '@/utils/constants';

@Injectable()
export class MultipleGuards implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowedGuards =
      this.reflector.get<Type<CanActivate>[]>(
        Keys.MULTIPLE_GUARDS,
        context.getHandler()
      ) || [];

    const guards = allowedGuards.map((guard) => {
      return this.moduleRef.get(guard.name);
    });

    if (guards.length === 0) {
      return Promise.resolve(false);
    }

    if (guards.length === 1) {
      return guards[0].canActivate(context) as Promise<boolean>;
    }

    return Promise.any(
      guards.map((guard) => {
        return guard.canActivate(context) as Promise<boolean>;
      })
    );
  }
}
