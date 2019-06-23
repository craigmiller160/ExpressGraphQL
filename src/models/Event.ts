import { Schema, model } from 'mongoose';
import IEvent from '../ts-types/Event.type';
import IExtendedDocument from '../ts-types/ExtendedDocument.type';

export interface IEventModel extends IEvent, IExtendedDocument<IEvent> {}

const eventSchema: Schema = new Schema({
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
    }
});

export default model<IEventModel>('Event', eventSchema);
