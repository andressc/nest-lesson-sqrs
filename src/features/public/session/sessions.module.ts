import { Module } from '@nestjs/common';
import { SessionsController } from './api/sessions.controller';
import { SessionsRepository } from './infrastructure/repository/sessions.repository';
import { QuerySessionsRepository } from './api/query/query-sessions.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from './entity/session.schema';
import { RemoveAllUserSessionHandler } from './application/commands/remove-all-user-session.handler';
import { RemoveUserSessionHandler } from './application/commands/remove-user-session.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { SessionsRepositoryAdapter } from './adapters/sessions.repository.adapter';
import { QuerySessionsRepositoryAdapter } from './adapters/query.sessions.repository.adapter';

export const CommandHandlers = [RemoveAllUserSessionHandler, RemoveUserSessionHandler];
export const Repositories = [
	{
		provide: QuerySessionsRepositoryAdapter,
		useClass: QuerySessionsRepository,
	},
	{
		provide: SessionsRepositoryAdapter,
		useClass: SessionsRepository,
	},
];
export const Services = [];

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Session.name,
				schema: SessionSchema,
			},
		]),
		CqrsModule,
	],

	controllers: [SessionsController],
	providers: [...Services, ...Repositories, ...CommandHandlers],
	exports: [
		{
			provide: QuerySessionsRepositoryAdapter,
			useClass: QuerySessionsRepository,
		},
		{
			provide: SessionsRepositoryAdapter,
			useClass: SessionsRepository,
		},
	],
})
export class SessionsModule {}
