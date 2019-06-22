import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import graphqlHttp from 'express-graphql';

const port: number = Number(process.env.PORT) || 3000;

const app: Express = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    schema: null,
    rootValue: {}
}));

app.listen(port);
