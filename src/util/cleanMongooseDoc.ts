import ExtendedDocument from '../ts-types/ExtendedDocument.type';
import IBaseDb from '../ts-types/BaseDb.type';

export default <T extends IBaseDb>(doc: ExtendedDocument<T>): any => ({
    ...doc._doc,
    _id: doc._doc._id
});
