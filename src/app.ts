import express, { Express } from 'express';
import bodyParser from 'body-parser';
import graphqlHttp from 'express-graphql';
import { buildSchema } from 'graphql';
import mongoose from 'mongoose';
import IEvent from './ts-types/Event.type';
import IEventInput from './ts-types/EventInput.type';
import trimWhitespace from './util/trimWhitespace';
import EventModel, { IEventModel } from './models/Event';
import cleanMongooseDoc from './util/cleanMongooseDoc';

interface ICreateEventArgs {
    eventInput: IEventInput;
}

const port: number = Number(process.env.PORT);
const mongoUser: string = process.env.MONGO_USER;
const mongoPass: string = process.env.MONGO_PASSWORD;
const mongoAuthDb: string = process.env.MONGO_AUTH_DB;
const mongoDb: string = process.env.MONGO_DB;

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
        }
        
        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }
    
        type RootQuery {
            events: [Event!]!
        }
        
        type RootMutation {
            createEvent(eventInput: EventInput): Event
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
                return events.map((event) => cleanMongooseDoc(event));
            } catch (ex) {
                console.log(ex); // tslint:disable-line no-console
                throw ex;
            }
        },
        createEvent: async (args: ICreateEventArgs): Promise<IEvent> => {
            const { eventInput } = args;
            const event = new EventModel({
                title: eventInput.title,
                description: eventInput.description,
                price: +eventInput.price,
                date: new Date(eventInput.date)
            });
            try {
                const result: IEventModel = await event.save();
                return cleanMongooseDoc(result);
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
