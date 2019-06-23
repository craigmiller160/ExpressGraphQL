import express, { Express } from 'express';
import bodyParser from 'body-parser';
import graphqlHttp from 'express-graphql';
import { buildSchema } from 'graphql';
import mongoose from 'mongoose';
import IEvent from './ts-types/Event.type';
import IEventInput from './ts-types/EventInput.type';

interface ICreateEventArgs {
    eventInput: IEventInput;
}

const port: number = Number(process.env.PORT);
const mongoUser: string = process.env.MONGO_USER;
const mongoPass: string = process.env.MONGO_PASSWORD;
const mongoAuthDb: string = process.env.MONGO_AUTH_DB;

const app: Express = express();

app.use(bodyParser.json());

const events: IEvent[] = [];

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
        events: (): IEvent[] => {
            return events;
        },
        createEvent: (args: ICreateEventArgs): IEvent => {
            const { eventInput } = args;
            const event: IEvent = {
                _id: Math.random().toString(),
                title: eventInput.title,
                description: eventInput.description,
                price: +eventInput.price,
                date: eventInput.date
            };
            events.push(event);
            return event;
        }
    },
    graphiql: true
}));

mongoose.connect(`mongodb://${mongoUser}:${mongoPass}@localhost:27017/express_graphql?authSource=${mongoAuthDb}`, {
    useNewUrlParser: true
});

app.listen(port);
