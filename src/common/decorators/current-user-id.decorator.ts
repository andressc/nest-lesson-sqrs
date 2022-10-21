import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const CurrentUserId = createParamDecorator((data: unknown, context: ExecutionContext) => {
	const request = context.switchToHttp().getRequest();
	if (!request.user.userId) throw new UnauthorizedException({ a: 'fgfdsdf' });
	return request.user.userId;
});
