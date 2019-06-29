import IBaseDb from './BaseDb.type';
import IEvent from './Event.type';
import IUser from './User.type';
import IMongooseTimestamps from './MongooseTimestamps.type';

export default interface IBooking extends IBaseDb, IMongooseTimestamps {
    event: string | IEvent;
    user: string | IUser;
}
