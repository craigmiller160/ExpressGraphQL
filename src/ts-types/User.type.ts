import IBaseDb from './BaseDb.type';

export default interface IUser extends IBaseDb {
    email: string;
    password?: string;
}
