import IBaseDb from './BaseDb.type';
import IEvent from './Event.type';

export default interface IUser extends IBaseDb {
    email: string;
    password?: string;
    createdEvents: string[] | IEvent[];
}
