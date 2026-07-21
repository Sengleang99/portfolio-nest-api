import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

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
export class Category {
  @Prop({
    required: true,
    trim: true,
    unique: true,
    index: true,
  })
  name: string;

  @Prop({
    trim: true,
    default: '',
  })
  icon: string;

  @Prop({
    trim: true,
    default: '',
  })
  descr: string;

  @Prop({
    required: true,
    trim: true,
  })
  color: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Index for search optimization
CategorySchema.index({ name: 'text', descr: 'text' });
