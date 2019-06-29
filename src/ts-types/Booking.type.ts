import IBaseDb from './BaseDb.type';
import IEvent from './Event.type';
import IUser from './User.type';

export default interface IBooking extends IBaseDb{
    event: string | IEvent;
    user: string | IUser;
}
