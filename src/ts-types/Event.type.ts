import IBaseDb from './BaseDb.type';

export default interface IEvent extends IBaseDb {
    title: string;
    description: string;
    price: number;
    date: string | Date;
}
