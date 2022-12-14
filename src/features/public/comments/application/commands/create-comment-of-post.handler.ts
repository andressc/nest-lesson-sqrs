import { createDate } from '../../../../../common/helpers';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { CreateCommentOfPostDto } from '../../dto';
import { UsersService } from '../../../../admin/users/application/users.service';
import { PostsService } from '../../../posts/application/posts.service';
import { UserModel } from '../../../../admin/users/entity/user.schema';
import { CommentModel } from '../../entity/comment.schema';
import { ValidationService } from '../../../../../shared/validation/application/validation.service';
import { CommentsRepositoryAdapter } from '../../adapters/comments.repository.adapter';

export class CreateCommentOfPostCommand implements ICommand {
	constructor(
		public data: CreateCommentOfPostDto,
		public postId: string,
		public authUserId: string,
	) {}
}

@CommandHandler(CreateCommentOfPostCommand)
export class CreateCommentOfPostHandler implements ICommandHandler<CreateCommentOfPostCommand> {
	constructor(
		private readonly usersService: UsersService,
		private readonly postsService: PostsService,
		private readonly commentsRepository: CommentsRepositoryAdapter,
		private readonly validationService: ValidationService,
	) {}

	async execute(command: CreateCommentOfPostCommand): Promise<string> {
		await this.validationService.validate(command.data, CreateCommentOfPostDto);

		const user: UserModel = await this.usersService.findUserByIdOrErrorThrow(command.authUserId);
		await this.postsService.findPostOrErrorThrow(command.postId);

		const newComment: CommentModel = await this.commentsRepository.createCommentModel({
			...command.data,
			userId: command.authUserId,
			userLogin: user.login,
			postId: command.postId,
			createdAt: createDate(),
		});

		const result = await this.commentsRepository.save(newComment);
		return result.id.toString();
	}
}
