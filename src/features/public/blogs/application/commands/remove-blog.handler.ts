import { BlogModel } from '../../entity/blog.schema';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsService } from '../blogs.service';
import { BlogsRepositoryAdapter } from '../../adapters/blogs.repository.adapter';

export class RemoveBlogCommand {
	constructor(public id: string) {}
}

@CommandHandler(RemoveBlogCommand)
export class RemoveBlogHandler implements ICommandHandler<RemoveBlogCommand> {
	constructor(
		private readonly blogsRepository: BlogsRepositoryAdapter<BlogModel>,
		private readonly blogsService: BlogsService,
	) {}

	async execute(command: RemoveBlogCommand): Promise<void> {
		const blog: BlogModel = await this.blogsService.findBlogOrErrorThrow(command.id);
		await this.blogsRepository.delete(blog);
	}
}
