import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

function cleanUserTransform(doc: unknown, ret: Record<string, unknown>) {
  const result: Record<string, unknown> = { ...ret };
  if (result._id instanceof Types.ObjectId) {
    result.id = result._id.toHexString();
  } else if (typeof result._id === 'string') {
    result.id = result._id;
  }
  delete result._id;
  delete result.__v;
  delete result.password;
  delete result.refreshTokenHash;
  return result;
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: cleanUserTransform,
  },
  toObject: {
    virtuals: true,
    transform: cleanUserTransform,
  },
})
export class User {
  @Prop({
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    index: true,
  })
  email: string;

  @Prop({
    required: true,
    select: false,
  })
  password: string;

  @Prop({
    trim: true,
    default: '',
  })
  name: string;

  @Prop({
    type: String,
    select: false,
    default: null,
  })
  refreshTokenHash?: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
