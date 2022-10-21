import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QueryBlogsRepository } from './api/query/query-blogs.repository';
import { BlogsService } from './application/blogs.service';
import { Blog, BlogSchema } from '../entity/blog.schema';
import { BlogsController } from './api/blogs.controller';
import { BlogsRepository } from './infrastructure/repository/blogs.repository';
import { ValidationService } from './application/validation.service';
import { PostsService } from './application/posts.service';
import { QueryPostsRepository } from './api/query/query-posts.repository';
import { PostsRepository } from './infrastructure/repository/posts.repository';
import { Post, PostSchema } from '../entity/post.schema';
import { PostsController } from './api/posts.controller';
import { TestingService } from './application/testing.service';
import { TestingController } from './api/testing.controller';
import { IsUserCommentValidatorConstraint } from '../common/decorators/ValidationDecorators/validate-blog-id.decorator';
import { PaginationService } from './application/pagination.service';
import { UsersModule } from '../users/users.module';
import { CommentsService } from './application/comments.service';
import { QueryCommentsRepository } from './api/query/query-comments.repository';
import { CommentsRepository } from './infrastructure/repository/comments.repository';
import { CommentsController } from './api/comments.controller';
import { Comment, CommentSchema } from '../entity/comment.schema';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
		MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
		MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
		UsersModule,
	],
	controllers: [BlogsController, PostsController, TestingController, CommentsController],
	providers: [
		BlogsService,
		ValidationService,
		PostsService,
		TestingService,
		CommentsService,

		PaginationService,
		IsUserCommentValidatorConstraint,

		QueryBlogsRepository,
		QueryPostsRepository,
		QueryCommentsRepository,

		BlogsRepository,
		PostsRepository,
		CommentsRepository,
	],

	exports: [ValidationService],
})
export class FeaturesModule {}
