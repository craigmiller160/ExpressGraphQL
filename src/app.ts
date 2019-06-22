import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';

const port: number = Number(process.env.PORT) || 3000;

const app: Express = express();

app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World');
});

app.listen(port);
