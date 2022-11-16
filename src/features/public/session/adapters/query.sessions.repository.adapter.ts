import { ResponseSessionDto } from '../dto/response-session.dto';

export abstract class QuerySessionsRepositoryAdapter {
	abstract findAllSessionsByUserId(currentUserId: string): Promise<ResponseSessionDto[]>;
}
