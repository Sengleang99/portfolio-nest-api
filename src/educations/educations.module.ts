import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { EducationsController } from './educations.controller';
import { EducationsService } from './educations.service';
import { Education, EducationSchema } from './schemas/education.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Education.name, schema: EducationSchema },
    ]),
    AuthModule,
  ],
  controllers: [EducationsController],
  providers: [EducationsService],
  exports: [EducationsService, MongooseModule],
})
export class EducationsModule {}
