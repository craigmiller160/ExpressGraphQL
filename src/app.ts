import * as express from 'express';
import * as bodyParser from 'body-parser';

const port: number = Number(process.env.PORT) || 3000;

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(port);