import IBaseDb from './BaseDb.type';
import IUser from './User.type';

export default interface IEvent extends IBaseDb {
    title: string;
    description: string;
    price: number;
    date: string | Date;
    creator: string | IUser;
}
