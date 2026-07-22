import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExperiencesController } from './experiences.controller';
import { ExperiencesService } from './experiences.service';
import { Experience, ExperienceSchema } from './schemas/experience.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Experience.name, schema: ExperienceSchema },
    ]),
    AuthModule
  ],
  controllers: [ExperiencesController],
  providers: [ExperiencesService],
  exports: [ExperiencesService, MongooseModule],
})
export class ExperiencesModule { }
