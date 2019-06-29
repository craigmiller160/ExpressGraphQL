import express, { Express } from 'express';
import bodyParser from 'body-parser';
import graphqlHttp from 'express-graphql';
import mongoose from 'mongoose';
import trimWhitespace from './util/trimWhitespace';
import UserModel, { IUserModel } from './models/User';
import schema from './graphql/schema';
import rootResolver from './graphql/resolvers';

const port: number = Number(process.env.PORT);
const mongoUser: string = process.env.MONGO_USER;
const mongoPass: string = process.env.MONGO_PASSWORD;
const mongoAuthDb: string = process.env.MONGO_AUTH_DB;
const mongoDb: string = process.env.MONGO_DB;

const app: Express = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    schema,
    rootValue: rootResolver,
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
            global.defaultUserId = userResult._doc._id.toString();
        }
        app.listen(port);
    } catch (ex) {
        console.log(ex); // tslint:disable-line no-console
    }
})();
