import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
	LikesInfoExtended,
	LikeStatusEnum,
	PaginationCalc,
	PaginationDto,
	QueryDto,
} from '../../../../../common/dto';
import { Post, PostModel } from '../../entity/post.schema';
import { QueryPostsRepositoryAdapter } from '../../adapters/query.posts.repository.adapter';
import { ObjectId } from 'mongodb';
import { LikeDbDto } from '../../../likes/dto/like-db.dto';
import { ResponsePostDto } from '../../dto';
import { BlogNotFoundException, PostNotFoundException } from '../../../../../common/exceptions';
import { Blog, BlogModel } from '../../../blogs/entity/blog.schema';
import { PaginationService } from '../../../../../shared/pagination/application/pagination.service';

@Injectable()
export class QueryPostsRepository implements QueryPostsRepositoryAdapter {
	constructor(
		@InjectModel(Post.name)
		private readonly postModel: Model<PostModel>,
		@InjectModel(Blog.name)
		private readonly blogModel: Model<BlogModel>,
		private readonly paginationService: PaginationService,
	) {}

	async findOnePost(id: string, currentUserId: string | null): Promise<ResponsePostDto | null> {
		const post: PostModel[] | null = await this.postModel.aggregate([
			{ $match: { _id: new ObjectId(id) } },
			{
				$graphLookup: {
					from: 'likes',
					startWith: '$_id',
					connectFromField: '_id',
					connectToField: 'itemId',
					as: 'likes',
				},
			},
		]);

		if (!post[0]) throw new PostNotFoundException(id);

		const postModel = post[0];
		const extendedLikesInfo = this.countLikes(postModel, currentUserId);

		return {
			id: postModel._id.toString(),
			title: postModel.title,
			shortDescription: postModel.shortDescription,
			content: postModel.content,
			blogId: postModel.blogId,
			blogName: postModel.blogName,
			createdAt: postModel.createdAt,
			extendedLikesInfo,
		};
	}

	async findAllPosts(
		query: QueryDto,
		currentUserId: string | null,
		blogId?: string,
	): Promise<PaginationDto<ResponsePostDto[]>> {
		const searchString = blogId ? { blogId: blogId } : {};

		console.log(searchString);

		const blog: BlogModel | null = await this.blogModel.findById(blogId);
		if (!blog && blogId) throw new BlogNotFoundException(blogId);

		const totalCount: number = await this.postModel.countDocuments(searchString);

		const paginationData: PaginationCalc = this.paginationService.pagination({
			...query,
			totalCount,
		});

		const post: PostModel[] = await this.postModel
			.aggregate([
				{ $match: searchString },
				{
					$graphLookup: {
						from: 'likes',
						startWith: '$_id',
						connectFromField: '_id',
						connectToField: 'itemId',
						as: 'likes',
					},
				},
			])
			.sort(paginationData.sortBy)
			.skip(paginationData.skip)
			.limit(paginationData.pageSize);

		let likesInfo;
		return {
			pagesCount: paginationData.pagesCount,
			page: paginationData.pageNumber,
			pageSize: paginationData.pageSize,
			totalCount: totalCount,
			items: post.map((v: PostModel) => {
				likesInfo = this.countLikes(v, currentUserId);

				return {
					id: v._id.toString(),
					title: v.title,
					shortDescription: v.shortDescription,
					content: v.content,
					blogId: v.blogId,
					blogName: v.blogName,
					createdAt: v.createdAt,
					extendedLikesInfo: likesInfo,
				};
			}),
		};
	}

	private countLikes(post: PostModel, currentUserId: string | null): LikesInfoExtended {
		const likesCount = post.likes.filter(
			(v: LikeDbDto) => v.likeStatus === LikeStatusEnum.Like && !v.isBanned,
		).length;

		const dislikesCount = post.likes.filter(
			(v: LikeDbDto) => v.likeStatus === LikeStatusEnum.Dislike && !v.isBanned,
		).length;

		let myStatus = LikeStatusEnum.None;

		const newestLikes = [...post.likes]
			.filter((v: LikeDbDto) => v.likeStatus === LikeStatusEnum.Like && !v.isBanned)
			.sort((a: LikeDbDto, b: LikeDbDto) => (a.addedAt > b.addedAt ? -1 : 1))
			.slice(0, 3)
			.map((v: LikeDbDto) => ({
				addedAt: v.addedAt,
				userId: v.userId.toString(),
				login: v.login,
			}));

		post.likes.forEach((it: LikeDbDto) => {
			if (currentUserId && new ObjectId(it.userId).equals(currentUserId)) myStatus = it.likeStatus;
		});

		return {
			likesCount,
			dislikesCount,
			myStatus,
			newestLikes,
		};
	}
}
