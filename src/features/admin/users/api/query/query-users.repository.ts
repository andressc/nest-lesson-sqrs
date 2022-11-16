import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationCalc, PaginationDto } from '../../../../../common/dto';
import { User, UserModel } from '../../entity/user.schema';
import { QueryUsersRepositoryAdapter } from '../../adapters/query.users.repository.adapter';
import { UserNotFoundException } from '../../../../../common/exceptions';
import { QueryUserDto, ResponseUserDto, ResponseUserMeDto } from '../../dto';
import { PaginationService } from '../../../../../shared/pagination/application/pagination.service';

@Injectable()
export class QueryUsersRepository implements QueryUsersRepositoryAdapter {
	constructor(
		@InjectModel(User.name)
		private readonly userModel: Model<UserModel>,
		private readonly paginationService: PaginationService,
	) {}

	async findAllUser(query: QueryUserDto): Promise<PaginationDto<ResponseUserDto[]>> {
		const searchString = this.searchTerm(query.searchLoginTerm, query.searchEmailTerm);

		const totalCount: number = await this.userModel.countDocuments(searchString);
		const paginationData: PaginationCalc = this.paginationService.pagination({
			...query,
			totalCount,
		});

		const user: UserModel[] = await this.userModel
			.find(searchString)
			.sort(paginationData.sortBy)
			.skip(paginationData.skip)
			.limit(paginationData.pageSize);

		return {
			pagesCount: paginationData.pagesCount,
			page: paginationData.pageNumber,
			pageSize: paginationData.pageSize,
			totalCount: totalCount,
			items: user.map((v: UserModel) => ({
				id: v._id.toString(),
				login: v.login,
				email: v.email,
				createdAt: v.createdAt,
				banInfo: {
					isBanned: v.isBanned,
					banDate: v.banDate,
					banReason: v.banReason,
				},
			})),
		};
	}

	async findOneUser(id: string) {
		const user: UserModel = await this.findUserModelByIdOrThrowError(id);

		return {
			id: user._id,
			login: user.login,
			email: user.email,
			createdAt: user.createdAt,
			banInfo: {
				isBanned: user.isBanned,
				banDate: user.banDate,
				banReason: user.banReason,
			},
		};
	}

	async findMe(id: string): Promise<ResponseUserMeDto> {
		const user: UserModel = await this.findUserModelByIdOrThrowError(id);

		return {
			email: user.email,
			login: user.login,
			userId: user._id,
		};
	}

	private searchTerm(login: string | undefined, email: string | undefined): any {
		let searchString = {};

		const searchLoginTerm = login
			? {
					login: { $regex: login, $options: 'i' },
			  }
			: null;
		const searchEmailTerm = email
			? {
					email: { $regex: email, $options: 'i' },
			  }
			: null;

		if (searchLoginTerm) searchString = searchLoginTerm;
		if (searchEmailTerm) searchString = searchEmailTerm;

		if (searchLoginTerm && searchEmailTerm)
			searchString = {
				$or: [searchLoginTerm, searchEmailTerm],
			};

		return searchString;
	}

	private async findUserModelByIdOrThrowError(userId): Promise<UserModel> {
		const user: UserModel | null = await this.userModel.findById(userId);
		if (!user) throw new UserNotFoundException(userId);

		return user;
	}
}
