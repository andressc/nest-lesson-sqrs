import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationCalc, PaginationDto } from '../../../../../common/dto';
import { Blog, BlogModel } from '../../entity/blog.schema';
import { QueryBlogsRepositoryAdapter } from '../../adapters/query.blogs.repository.adapter';
import { QueryBlogDto, ResponseBlogDto } from '../../dto';
import { BlogNotFoundException } from '../../../../../common/exceptions';
import { PaginationService } from '../../../../../shared/pagination/application/pagination.service';

@Injectable()
export class QueryBlogsRepository implements QueryBlogsRepositoryAdapter {
	constructor(
		@InjectModel(Blog.name) private readonly blogModel: Model<BlogModel>,
		private readonly paginationService: PaginationService,
	) {}

	async findOneBlog(id: string): Promise<ResponseBlogDto> {
		const blog: BlogModel | null = await this.blogModel.findById(id);
		if (!blog) throw new BlogNotFoundException(id);

		return {
			id: blog._id,
			youtubeUrl: blog.youtubeUrl,
			name: blog.name,
			createdAt: blog.createdAt,
		};
	}

	async findAllBlogs(query: QueryBlogDto): Promise<PaginationDto<ResponseBlogDto[]>> {
		const searchString = query.searchNameTerm
			? {
					name: {
						$regex: query.searchNameTerm,
						$options: 'i',
					},
			  }
			: {};

		const totalCount: number = await this.blogModel.countDocuments(searchString);
		const paginationData: PaginationCalc = this.paginationService.pagination({
			...query,
			totalCount,
		});

		const blog: BlogModel[] = await this.blogModel
			.find(searchString)
			.sort(paginationData.sortBy)
			.skip(paginationData.skip)
			.limit(paginationData.pageSize);

		return {
			pagesCount: paginationData.pagesCount,
			page: paginationData.pageNumber,
			pageSize: paginationData.pageSize,
			totalCount: totalCount,
			items: blog.map((v: BlogModel) => ({
				id: v._id.toString(),
				youtubeUrl: v.youtubeUrl,
				name: v.name,
				createdAt: v.createdAt,
			})),
		};
	}
}
