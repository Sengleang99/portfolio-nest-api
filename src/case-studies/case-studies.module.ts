import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { CaseStudiesController } from './case-studies.controller';
import { CaseStudiesService } from './case-studies.service';
import { CaseStudy, CaseStudySchema } from './schemas/case-study.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CaseStudy.name, schema: CaseStudySchema },
    ]),
    AuthModule,
  ],
  controllers: [CaseStudiesController],
  providers: [CaseStudiesService],
  exports: [CaseStudiesService],
})
export class CaseStudiesModule {}
