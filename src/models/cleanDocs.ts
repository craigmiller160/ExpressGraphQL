import IBaseDb from '../ts-types/BaseDb.type';
import IExtendedDocument from '../ts-types/ExtendedDocument.type';
import IMongooseTimestamps from '../ts-types/MongooseTimestamps.type';

export const cleanBaseDoc = <T extends IBaseDb>(doc: IExtendedDocument<T>): T => ({
    ...doc._doc,
    _id: doc._doc._id
});

export const cleanMongooseTimestamps = <T extends IMongooseTimestamps>(obj: T): IMongooseTimestamps => ({
    createdAt: new Date(obj.createdAt).toISOString(),
    updatedAt: new Date(obj.updatedAt).toISOString()
});
