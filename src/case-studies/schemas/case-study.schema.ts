import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CaseStudyDocument = HydratedDocument<CaseStudy>;

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
export class CaseStudy {
  @Prop({
    required: true,
    trim: true,
    index: true,
  })
  title: string;

  @Prop({
    required: true,
    trim: true,
    index: true,
  })
  tag: string;

  @Prop({
    required: true,
    trim: true,
  })
  description: string;

  @Prop({
    required: true,
    trim: true,
  })
  longDescription: string;

  @Prop({
    type: [String],
    required: true,
    default: [],
  })
  tech: string[];

  @Prop({
    trim: true,
  })
  imageUrl?: string;

  @Prop({
    required: true,
    trim: true,
  })
  githubUrl: string;

  @Prop({
    required: true,
    trim: true,
  })
  demoUrl: string;
}

export const CaseStudySchema = SchemaFactory.createForClass(CaseStudy);

// Index for search optimization
CaseStudySchema.index({
  title: 'text',
  tag: 'text',
  description: 'text',
  longDescription: 'text',
  tech: 'text',
});
