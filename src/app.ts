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

const app: Express = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: String!
        }
        
        type User {
            _id: ID!
            email: String!
            password: String
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
                const events = await EventModel.find();
                return events.map(cleanMongooseDoc);
            } catch (ex) {
                console.log(ex); // tslint:disable-line no-console
                throw ex;
            }
        },
        createEvent: async ({ eventInput }: ICreateEventArgs): Promise<IEvent> => {
            try {
                const event = new EventModel({
                    title: eventInput.title,
                    description: eventInput.description,
                    price: +eventInput.price,
                    date: new Date(eventInput.date),
                    creator: '5d0fb00b1fd7121711ea36f6'
                });

                const eventResult: IEventModel = await event.save();
                const userResult: IUserModel = await UserModel.findById('5d0fb00b1fd7121711ea36f6');
                if (userResult) {
                    throw new Error('Could not find user who created event');
                }
                userResult.createdEvents.push(eventResult._id.toString());
                await userResult.save();
                return cleanMongooseDoc(eventResult);
            } catch (ex) {
                console.log(ex); // tslint:disable-line no-console
                throw ex;
            }
        },
        users: async (): Promise<IUser[]> => {
            try {
                const users = await UserModel.find();
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
                const existingUser = await UserModel.findOne({
                    email: userInput.email
                });
                if (existingUser) {
                    throw new Error(`User exists already: ${userInput.email}`);
                }

                const passwordHash = await bcrypt.hash(userInput.password, saltRounds);
                const user = new UserModel({
                    email: userInput.email,
                    password: passwordHash
                });

                const result: IUserModel = await user.save();
                return {
                    ...cleanMongooseDoc(result),
                    password: null
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
        app.listen(port);
    } catch (ex) {
        console.log(ex); // tslint:disable-line no-console
    }
})();
