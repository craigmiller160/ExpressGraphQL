import { Schema, model } from 'mongoose';
import IEvent from '../ts-types/Event.type';
import IExtendedDocument from '../ts-types/ExtendedDocument.type';
import { EVENT_MODEL, USER_MODEL } from './ModelNames';
import { cleanBaseDoc } from './cleanDocs';

export interface IEventModel extends IEvent, IExtendedDocument<IEvent> {}

const eventSchema: Schema<IEventModel> = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: USER_MODEL
    }
});

export default model<IEventModel>(EVENT_MODEL, eventSchema);

export const cleanEvent = (event: IEventModel): IEvent => ({
    ...cleanBaseDoc(event),
    date: new Date(event._doc.date).toISOString()
});
