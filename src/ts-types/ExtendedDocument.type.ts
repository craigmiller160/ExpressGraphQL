import { Document } from 'mongoose';
import IBaseDb from './BaseDb.type';

export default interface IExtendedDocument<T extends IBaseDb> extends Document {
    _doc: T;
}
