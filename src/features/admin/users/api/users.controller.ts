import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	Query,
	UseGuards,
} from '@nestjs/common';

import { CreateUserDto, QueryUserDto } from '../dto';
import { ObjectIdDto } from '../../../../common/dto';
import { BasicAuthGuard } from '../../../../common/guards';
import { CommandBus } from '@nestjs/cqrs';
import { RemoveUserCommand } from '../application/commands/remove-user.handler';
import { CreateUserCommand } from '../application/commands/create-user.handler';
import { BanUnbanUserCommand } from '../application/commands/ban-unban-user.handler';
import { BanUnbanUserDto } from '../dto/ban-unban-user.dto';
import { QueryUsersRepositoryAdapter } from '../adapters/query.users.repository.adapter';

@Controller('users')
export class UsersController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryUsersRepository: QueryUsersRepositoryAdapter,
	) {}

	@UseGuards(BasicAuthGuard)
	@Post()
	async createUser(@Body() data: CreateUserDto) {
		const userId = await this.commandBus.execute(new CreateUserCommand(data, true));
		return await this.queryUsersRepository.findOneUser(userId);
	}

	@Get()
	async findAllUsers(@Query() query: QueryUserDto) {
		return await this.queryUsersRepository.findAllUser(query);
	}

	@HttpCode(204)
	@UseGuards(BasicAuthGuard)
	@Put(':id/ban')
	banUser(@Param() param: ObjectIdDto, @Body() data: BanUnbanUserDto) {
		return this.commandBus.execute(new BanUnbanUserCommand(param.id, data));
	}

	@HttpCode(204)
	@UseGuards(BasicAuthGuard)
	@Delete(':id')
	async removeUser(@Param() param: ObjectIdDto) {
		await this.commandBus.execute(new RemoveUserCommand(param.id));
	}
}
