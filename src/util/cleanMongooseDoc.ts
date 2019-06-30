import ExtendedDocument from '../ts-types/ExtendedDocument.type';
import IBaseDb from '../ts-types/BaseDb.type';
import IMongooseTimestamps from '../ts-types/MongooseTimestamps.type';

export default <T extends IBaseDb>(doc: ExtendedDocument<T>): any => {
    const result = {
        ...doc._doc,
        _id: doc._doc._id
    };
    handleMongooseTimestamp(result);
    return result;
};

const handleMongooseTimestamp = <T extends IBaseDb>(obj: T): void => {
    if ('createdAt' in obj && 'updatedAt' in obj) {
        const mongooseTimestamp = (obj as unknown) as IMongooseTimestamps;
        mongooseTimestamp.createdAt = new Date(mongooseTimestamp.createdAt).toISOString();
        mongooseTimestamp.updatedAt = new Date(mongooseTimestamp.updatedAt).toISOString();
    }
};
