import IUser from '../../ts-types/User.type';
import UserModel, { cleanUser, IUserModel } from '../../models/User';
import cleanMongooseDoc from '../../util/cleanMongooseDoc';
import IEvent from '../../ts-types/Event.type';
import EventModel, { cleanEvent, IEventModel } from '../../models/Event';
import bcrypt from 'bcryptjs';
import IEventInput from '../../ts-types/EventInput.type';
import IUserInput from '../../ts-types/UserInput.type';
import BookingModel, { cleanBooking, IBookingModel } from '../../models/Booking';

interface ICreateEventArgs {
    eventInput: IEventInput;
}

interface ICreateUserArgs {
    userInput: IUserInput;
}

interface IBookEventArgs {
    eventId: string;
}

interface ICancelBookingArgs {
    bookingId: string;
}

const saltRounds: number = Number(process.env.SALT_ROUNDS);

const getUser = async (userId: string): Promise<IUser> => {
    const userResult: IUserModel = await UserModel.findById(userId);
    return {
        ...cleanUser(userResult),
        createdEvents: getEvents.bind(this, userResult._doc.createdEvents as string[])
    };
};

const getEvents = async (eventIds: string[]): Promise<IEvent[]> => {
    const eventsResult: IEventModel[] = await EventModel.find({ _id: { $in: eventIds } });
    return eventsResult.map((event: IEventModel) => ({
        ...cleanEvent(event),
        creator: getUser.bind(this, event._doc.creator as string)
    }));
};

const getEvent = async (eventId: string): Promise<IEvent> => {
    const eventResult: IEventModel = await EventModel.findById(eventId);
    return {
        ...cleanEvent(eventResult),
        creator: getUser.bind(this, eventResult._doc.creator as string)
    };
};

const rootResolver =  {
    events: async (): Promise<IEvent[]> => {
        try {
            const events: IEventModel[] = await EventModel.find();
            return events.map((event: IEventModel) => ({
                ...cleanEvent(event),
                creator: getUser.bind(this, event._doc.creator as string)
            }));

        } catch (ex) {
            console.log(ex); // tslint:disable-line no-console
            throw ex;
        }
    },
    createEvent: async ({ eventInput }: ICreateEventArgs): Promise<IEvent> => {
        if (!global.defaultUserId) {
            throw new Error('Cannot create an event until the default User ID is set');
        }

        try {
            const userResult: IUserModel = await UserModel.findById(global.defaultUserId);
            if (!userResult) {
                throw new Error('Could not find user who created event');
            }

            const event = new EventModel({
                title: eventInput.title,
                description: eventInput.description,
                price: +eventInput.price,
                date: new Date(eventInput.date),
                creator: userResult._doc._id
            });

            const eventResult: IEventModel = await event.save();
            userResult.createdEvents.push(eventResult._doc._id.toString());
            await userResult.save();
            return {
                ...cleanEvent(eventResult),
                creator: getUser.bind(this, eventResult._doc.creator)
            };
        } catch (ex) {
            console.log(ex); // tslint:disable-line no-console
            throw ex;
        }
    },
    users: async (): Promise<IUser[]> => {
        try {
            const users: IUserModel[] = await UserModel.find();
            return users.map((user: IUserModel) => ({
                ...cleanUser(user),
                createdEvents: getEvents.bind(this, user._doc.createdEvents as string[])
            }));
        } catch (ex) {
            console.log(ex); // tslint:disable-line no-console
            throw ex;
        }
    },
    createUser: async ({ userInput }: ICreateUserArgs): Promise<IUser> => {
        try {
            const existingUser: IUserModel = await UserModel.findOne({
                email: userInput.email
            });
            if (existingUser) {
                throw new Error(`User exists already: ${userInput.email}`);
            }

            const passwordHash: string = await bcrypt.hash(userInput.password, saltRounds);
            const user: IUserModel = new UserModel({
                email: userInput.email,
                password: passwordHash
            });

            const result: IUserModel = await user.save();
            if (!global.defaultUserId) {
                global.defaultUserId = result._doc._id.toString();
            }
            return cleanUser(result);
        } catch (ex) {
            console.log(ex); // tslint:disable-line no-console
            throw ex;
        }
    },
    bookings: async () => {
        try {
            const bookings: IBookingModel[] = await BookingModel.find();
            return bookings.map((booking: IBookingModel) => ({
                ...cleanBooking(booking),
                event: getEvent.bind(this, booking._doc.event as string),
                user: getUser.bind(this, booking.user as string)
            }));
        } catch (ex) {
            console.log(ex); // tslint:disable-line no-console
            throw ex;
        }
    },
    bookEvent: async ({ eventId }: IBookEventArgs) => {
        try {
            const event: IEventModel = await EventModel.findById({ _id: eventId });
            if (!event) {
                throw new Error(`Unable to find event with ID: ${event}`);
            }

            const booking = new BookingModel({
                user: global.defaultUserId,
                event
            });
            const result: IBookingModel = await booking.save();
            return {
                ...cleanBooking(booking),
                event: getEvent.bind(this, result._doc.event as string),
                user: getUser.bind(this, result._doc.user as string)
            };
        } catch (ex) {
            console.log(ex); // tslint:disable-line no-console
            throw ex;
        }
    },
    cancelBooking: async ({ bookingId }: ICancelBookingArgs) => {
        try {
            const booking = await BookingModel.findById(bookingId).populate('event');
            await BookingModel.deleteOne({ _id: bookingId });
            return {
                ...cleanEvent(booking.event as IEventModel),
                date: new Date((booking.event as IEventModel)._doc.date).toISOString(),
                creator: getUser.bind(this, (booking.event as IEventModel)._doc.creator as string)
            };
        } catch (ex) {
            console.log(ex); // tslint:disable-line no-console
            throw ex;
        }
    }
};

export default rootResolver;
