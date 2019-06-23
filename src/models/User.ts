import { model, Schema } from 'mongoose';
import IUser from '../ts-types/User.type';
import { EVENT_MODEL, USER_MODEL } from './ModelNames';
import IExtendedDocument from '../ts-types/ExtendedDocument.type';

export interface IUserModel extends IUser, IExtendedDocument<IUser> {}

const userSchema: Schema<IUserModel> = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    createdEvents: [
        {
            type: Schema.Types.ObjectId,
            ref: EVENT_MODEL
        }
    ]
});

export default model<IUserModel>(USER_MODEL, userSchema);
