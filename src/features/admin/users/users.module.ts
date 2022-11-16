import { Module } from '@nestjs/common';
import { UsersService } from './application/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './api/users.controller';
import { QueryUsersRepository } from './api/query/query-users.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { RemoveUserHandler } from './application/commands/remove-user.handler';
import { CreateUserHandler } from './application/commands/create-user.handler';
import { User, UserSchema } from './entity/user.schema';
import { UsersRepositoryAdapter } from './adapters/users.repository.adapter';
import { UsersRepository } from './infrastructure/repository/users.repository';
import { QueryUsersRepositoryAdapter } from './adapters/query.users.repository.adapter';
import { BanUnbanUserHandler } from './application/commands/ban-unban-user.handler';
import { SessionsModule } from '../../public/session/sessions.module';
import { LikesModule } from '../../public/likes/likes.module';
import { PaginationModule } from '../../../shared/pagination/pagination.module';

export const CommandHandlers = [RemoveUserHandler, CreateUserHandler, BanUnbanUserHandler];
export const Repositories = [
	{
		provide: QueryUsersRepositoryAdapter,
		useClass: QueryUsersRepository,
	},
	{
		provide: UsersRepositoryAdapter,
		useClass: UsersRepository,
	},
];
export const Services = [UsersService];
export const Modules = [
	MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
	SessionsModule,
	CqrsModule,
	LikesModule,
	PaginationModule,
];

@Module({
	imports: Modules,

	controllers: [UsersController],
	providers: [...Services, ...Repositories, ...CommandHandlers],
	exports: [
		UsersService,
		{
			provide: UsersRepositoryAdapter,
			useClass: UsersRepository,
		},
		{
			provide: QueryUsersRepositoryAdapter,
			useClass: QueryUsersRepository,
		},
	],
})
export class UsersModule {}
