import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ContactDocument = HydratedDocument<Contact>;

function cleanTransform(doc: unknown, ret: Record<string, unknown>) {
  const result: Record<string, unknown> = { ...ret };
  if (result._id instanceof Types.ObjectId) {
    result.id = result._id.toHexString();
  } else if (typeof result._id === 'string') {
    result.id = result._id;
  }
  delete result._id;
  delete result.__v;
  return result;
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: cleanTransform,
  },
  toObject: {
    virtuals: true,
    transform: cleanTransform,
  },
})
export class Contact {
  @Prop({
    required: true,
    trim: true,
    index: true,
  })
  username: string;

  @Prop({
    required: true,
    trim: true,
    lowercase: true,
    index: true,
  })
  email: string;

  @Prop({
    required: true,
    trim: true,
  })
  message: string;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);

// Index for search optimization
ContactSchema.index({
  username: 'text',
  email: 'text',
  message: 'text',
});
