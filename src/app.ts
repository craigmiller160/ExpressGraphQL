import express, { Express } from 'express';
import bodyParser from 'body-parser';
import graphqlHttp from 'express-graphql';
import { buildSchema } from 'graphql';
import ICreateEvent from './ts-types/createEvent.type';

const port: number = Number(process.env.PORT) || 3000;

const app: Express = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type RootQuery {
            events: [String!]!
        }
        
        type RootMutation {
            createEvent(name: String): String
        }
    
        schema {
            query: RootQuery,
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: (): string[] => {
            return ['Romantic Cooking', 'Sailing', 'All-Night Coding'];
        },
        createEvent: (args: ICreateEvent): string => {
            const eventName = args.name;
            return eventName;
        }
    }
}));

app.listen(port);
