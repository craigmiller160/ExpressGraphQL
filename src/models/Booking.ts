import { Schema, model } from 'mongoose';
import IExtendedDocument from '../ts-types/ExtendedDocument.type';
import IBooking from '../ts-types/Booking.type';
import { BOOKING_MODEL, EVENT_MODEL, USER_MODEL } from './ModelNames';

export interface IBookingModel extends IBooking, IExtendedDocument<IBooking> { }

const bookingSchema: Schema<IBookingModel> = new Schema({
    event: {
        type: Schema.Types.ObjectId,
        ref: EVENT_MODEL
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: USER_MODEL
    }
}, {
    timestamps: true
});

export default model<IBookingModel>(BOOKING_MODEL, bookingSchema);
