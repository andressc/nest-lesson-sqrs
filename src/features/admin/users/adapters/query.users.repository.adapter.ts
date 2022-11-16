import { PaginationDto } from '../../../../common/dto';
import { QueryUserDto, ResponseUserDto, ResponseUserMeDto } from '../dto';

export abstract class QueryUsersRepositoryAdapter {
	abstract findAllUser(query: QueryUserDto): Promise<PaginationDto<ResponseUserDto[]>>;
	abstract findOneUser(id: string);
	abstract findMe(id: string): Promise<ResponseUserMeDto>;
}
