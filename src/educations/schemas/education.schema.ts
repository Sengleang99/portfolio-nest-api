import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EducationDocument = HydratedDocument<Education>;

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
export class Education {
  @Prop({
    required: true,
    trim: true,
    index: true,
  })
  degree: string;

  @Prop({
    required: true,
    trim: true,
    index: true,
  })
  major: string;

  @Prop({
    required: true,
    trim: true,
    index: true,
  })
  university: string;

  @Prop({
    required: true,
    trim: true,
  })
  start_year: string;

  @Prop({
    trim: true,
    default: 'Present',
  })
  end_year: string;

  @Prop({
    trim: true,
    default: '',
  })
  descr: string;
}

export const EducationSchema = SchemaFactory.createForClass(Education);

// Index for search optimization
EducationSchema.index({
  degree: 'text',
  major: 'text',
  university: 'text',
  descr: 'text',
});
