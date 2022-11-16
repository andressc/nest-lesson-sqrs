import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionModel } from '../../entity/session.schema';
import { QuerySessionsRepositoryAdapter } from '../../adapters/query.sessions.repository.adapter';
import { ResponseSessionDto } from '../../dto/response-session.dto';

@Injectable()
export class QuerySessionsRepository implements QuerySessionsRepositoryAdapter {
	constructor(
		@InjectModel(Session.name)
		private readonly sessionModel: Model<SessionModel>,
	) {}

	async findAllSessionsByUserId(currentUserId: string): Promise<ResponseSessionDto[]> {
		const session: SessionModel[] = await this.sessionModel.find({
			userId: currentUserId,
		});

		return session.map((v: SessionModel) => ({
			ip: v.ip,
			title: v.title,
			lastActiveDate: v.lastActiveDate,
			deviceId: v.deviceId,
		}));
	}
}
