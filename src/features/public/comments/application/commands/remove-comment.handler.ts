import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsService } from '../comments.service';
import { UsersService } from '../../../../admin/users/application/users.service';
import { CommentModel } from '../../entity/comment.schema';
import { PostsRepositoryAdapter } from '../../../posts/adapters/posts.repository.adapter';

export class RemoveCommentCommand {
	constructor(public id: string, public authUserId: string) {}
}

@CommandHandler(RemoveCommentCommand)
export class RemoveCommentHandler implements ICommandHandler<RemoveCommentCommand> {
	constructor(
		private readonly postsRepository: PostsRepositoryAdapter,
		private readonly commentsService: CommentsService,
		private readonly usersService: UsersService,
	) {}

	async execute(command: RemoveCommentCommand): Promise<void> {
		await this.usersService.findUserByIdOrErrorThrow(command.authUserId);

		const comment: CommentModel = await this.commentsService.findCommentOrErrorThrow(
			command.id,
			command.authUserId,
		);
		await comment.delete();
	}
}
