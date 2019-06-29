import IUser from '../../ts-types/User.type';
import UserModel, { IUserModel } from '../../models/User';
import cleanMongooseDoc from '../../util/cleanMongooseDoc';
import IEvent from '../../ts-types/Event.type';
import EventModel, { IEventModel } from '../../models/Event';
import bcrypt from 'bcryptjs';
import IEventInput from '../../ts-types/EventInput.type';
import IUserInput from '../../ts-types/UserInput.type';

interface ICreateEventArgs {
    eventInput: IEventInput;
}

interface ICreateUserArgs {
    userInput: IUserInput;
}

const saltRounds: number = Number(process.env.SALT_ROUNDS);

const getUser = async (userId: string): Promise<IUser> => {
    const userResult = await UserModel.findById(userId);
    return {
        ...cleanMongooseDoc(userResult),
        password: undefined,
        createdEvents: getEvents.bind(this, userResult._doc.createdEvents as string[])
    };
};

const getEvents = async (eventIds: string[]): Promise<IEvent[]> => {
    const eventsResult = await EventModel.find({ _id: { $in: eventIds } });
    return eventsResult.map((event) => ({
        ...cleanMongooseDoc(event),
        creator: getUser.bind(this, event._doc.creator as string)
    }));
};

const rootResolver =  {
    events: async (): Promise<IEvent[]> => {
        try {
            const events: IEventModel[] = await EventModel.find();
            return events.map((event) => ({
                ...cleanMongooseDoc(event),
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
                ...cleanMongooseDoc(eventResult),
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
            return users.map((user) => ({
                ...cleanMongooseDoc(user),
                password: null,
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
            return {
                ...cleanMongooseDoc(result),
                password: undefined
            };
        } catch (ex) {
            console.log(ex); // tslint:disable-line no-console
            throw ex;
        }
    }
};

export default rootResolver;
