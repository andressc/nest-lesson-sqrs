import { Body, Controller, Delete, Get, HttpCode, Param, Put, UseGuards } from '@nestjs/common';
import { ObjectIdDto } from '../../../../common/dto';
import { CreateRequestLikeDto, UpdateCommentDto } from '../dto';
import { AccessTokenGuard, GuestGuard } from '../../../../common/guards';
import {
	CurrentUserId,
	CurrentUserIdNonAuthorized,
	CurrentUserLogin,
} from '../../../../common/decorators/Param';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from '../application/commands/update-comment.handler';
import { RemoveCommentCommand } from '../application/commands/remove-comment.handler';
import { FindOneCommentCommand } from '../application/queries/find-one-comment.handler';
import { CreateLikeCommentCommand } from '../application/commands/create-like-comment.handler';

@Controller('comments')
export class CommentsController {
	constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

	@Get(':id')
	@UseGuards(GuestGuard)
	findOneComment(
		@Param() param: ObjectIdDto,
		@CurrentUserIdNonAuthorized()
		currentUserId: ObjectIdDto | null,
	) {
		return this.queryBus.execute(new FindOneCommentCommand(param.id, currentUserId.id));
	}

	@HttpCode(204)
	@UseGuards(AccessTokenGuard)
	@Put(':id')
	async updateComment(
		@Param() param: ObjectIdDto,
		@Body() data: UpdateCommentDto,
		@CurrentUserId() currentUserId,
	) {
		await this.commandBus.execute(new UpdateCommentCommand(param.id, data, currentUserId));
	}

	@HttpCode(204)
	@UseGuards(AccessTokenGuard)
	@Delete(':id')
	async removeComment(@Param() param: ObjectIdDto, @CurrentUserId() currentUserId) {
		await this.commandBus.execute(new RemoveCommentCommand(param.id, currentUserId));
	}

	@HttpCode(204)
	@UseGuards(AccessTokenGuard)
	@Put(':id/like-status')
	async setLike(
		@Param() param: ObjectIdDto,
		@CurrentUserId() currentUserId,
		@CurrentUserLogin() currentUserLogin,
		@Body() data: CreateRequestLikeDto,
	) {
		await this.commandBus.execute(
			new CreateLikeCommentCommand(param.id, currentUserId, currentUserLogin, data),
		);
	}
}
