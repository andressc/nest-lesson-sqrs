import { Injectable, OnApplicationShutdown } from '@nestjs/common';

@Injectable()
export class ThrottlerStorageService implements OnApplicationShutdown {
	private astorage: Record<string, number[]> = {};
	private timeoutIds: NodeJS.Timeout[] = [];

	get storage(): Record<string, number[]> {
		return this.astorage;
	}

	async getRecord(key: string): Promise<number[]> {
		return this.storage[key] || [];
	}

	async addRecord(key: string, ttl: number): Promise<void> {
		const ttlMilliseconds = ttl * 1000;
		if (!this.storage[key]) {
			this.storage[key] = [];
		}

		this.storage[key].push(Date.now() + ttlMilliseconds);

		const timeoutId = setTimeout(() => {
			this.storage[key].shift();
			clearTimeout(timeoutId);
			this.timeoutIds = this.timeoutIds.filter((id) => id != timeoutId);
		}, ttlMilliseconds);
		this.timeoutIds.push(timeoutId);
	}

	clearStorage() {
		this.astorage = {};
	}

	onApplicationShutdown() {
		this.timeoutIds.forEach(clearTimeout);
	}
}
