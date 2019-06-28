import express, { Express } from 'express';
import bodyParser from 'body-parser';
import graphqlHttp from 'express-graphql';
import { buildSchema } from 'graphql';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import IEvent from './ts-types/Event.type';
import IEventInput from './ts-types/EventInput.type';
import trimWhitespace from './util/trimWhitespace';
import EventModel, { IEventModel } from './models/Event';
import UserModel, { IUserModel } from './models/User';
import cleanMongooseDoc from './util/cleanMongooseDoc';
import IUserInput from './ts-types/UserInput.type';
import IUser from './ts-types/User.type';

interface ICreateEventArgs {
    eventInput: IEventInput;
}

interface ICreateUserArgs {
    userInput: IUserInput;
}

const port: number = Number(process.env.PORT);
const mongoUser: string = process.env.MONGO_USER;
const mongoPass: string = process.env.MONGO_PASSWORD;
const mongoAuthDb: string = process.env.MONGO_AUTH_DB;
const mongoDb: string = process.env.MONGO_DB;
const saltRounds: number = Number(process.env.SALT_ROUNDS);

let defaultUserId: string;

const app: Express = express();

app.use(bodyParser.json());

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

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: User!
        }
        
        type User {
            _id: ID!
            email: String!
            createdEvents: [Event!]!
        }
        
        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        
        input UserInput {
            email: String!
            password: String!
        }
    
        type RootQuery {
            events: [Event!]!
            users: [User!]!
        }
        
        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }
    
        schema {
            query: RootQuery,
            mutation: RootMutation
        }
    `),
    rootValue: {
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
            if (!defaultUserId) {
                throw new Error('Cannot create an event until the default User ID is set');
            }

            try {
                const userResult: IUserModel = await UserModel.findById(defaultUserId);
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
                    password: null
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
                if (!defaultUserId) {
                    defaultUserId = result._doc._id.toString();
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
    },
    graphiql: true
}));

(async () => {
    const mongoConnectionString = `mongodb://
            ${mongoUser}:${mongoPass}
            @localhost:27017/${mongoDb}
            ?authSource=${mongoAuthDb}`;

    try {
        await mongoose.connect(trimWhitespace(mongoConnectionString), {
            useNewUrlParser: true
        });
        const userResult: IUserModel = await UserModel.findOne();
        if (userResult) {
            defaultUserId = userResult._doc._id.toString();
        }
        app.listen(port);
    } catch (ex) {
        console.log(ex); // tslint:disable-line no-console
    }
})();
