import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ExperienceStatus } from '../enums/experience-status.enum';

export type ExperienceDocument = HydratedDocument<Experience>;

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
export class Experience {
  @Prop({
    required: true,
    trim: true,
    index: true,
  })
  position: string;

  @Prop({
    required: true,
    trim: true,
    index: true,
  })
  company: string;

  @Prop({
    required: true,
    trim: true,
  })
  from_year: string;

  @Prop({
    trim: true,
    default: 'Present',
  })
  to_year: string;

  @Prop({
    trim: true,
    default: '',
  })
  descr: string;

  @Prop({
    required: true,
    enum: ExperienceStatus,
    default: ExperienceStatus.JUNIOR,
    index: true,
  })
  status: ExperienceStatus;
}

export const ExperienceSchema = SchemaFactory.createForClass(Experience);

// Index for search optimization
ExperienceSchema.index({ position: 'text', company: 'text', descr: 'text' });
