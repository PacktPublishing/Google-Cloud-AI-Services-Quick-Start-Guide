import { User } from './user.model';

export class Message {
	_id?: string;
	description?: string;
	likes?: number;
	createdAt?: Date;
	createdBy?: User;
	thread?: any; // we will be saving with _id and getting a populated thread
	lastUpdatedBy?: User;
	lastUpdatedAt?: Date;
}
