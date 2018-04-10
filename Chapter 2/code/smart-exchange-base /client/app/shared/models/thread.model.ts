import { User } from './user.model';
import { Message } from './message.model';

export class Thread {
	_id?: string;
	title?: string;
	description?: string;
	tags?: [string];
	isPinned?: boolean;
	likes?: number;
	createdAt?: Date;
	lastUpdatedAt?: Date;
	createdBy?: User;
	lastUpdatedBy?: User;
	messages: [Message]
}
