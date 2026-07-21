import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { QueryExperienceDto } from './dto/query-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { Experience, ExperienceDocument } from './schemas/experience.schema';

@Injectable()
export class ExperiencesService {
  constructor(
    @InjectModel(Experience.name)
    private readonly experienceModel: Model<ExperienceDocument>,
  ) {}

  async create(createExperienceDto: CreateExperienceDto): Promise<Experience> {
    const createdExperience = new this.experienceModel(createExperienceDto);
    return createdExperience.save();
  }

  async findAll(queryDto: QueryExperienceDto) {
    const { page = 1, limit = 10, search, status } = queryDto;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { position: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { descr: { $regex: search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.experienceModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true })
        .exec(),
      this.experienceModel.countDocuments(filter).exec(),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    this.validateObjectId(id);

    const experience = await this.experienceModel
      .findById(id)
      .lean({ virtuals: true })
      .exec();

    if (!experience) {
      throw new NotFoundException(`Experience with ID "${id}" not found`);
    }

    return experience;
  }

  async update(id: string, updateExperienceDto: UpdateExperienceDto) {
    this.validateObjectId(id);

    const updatedExperience = await this.experienceModel
      .findByIdAndUpdate(id, updateExperienceDto, {
        new: true,
        runValidators: true,
      })
      .lean({ virtuals: true })
      .exec();

    if (!updatedExperience) {
      throw new NotFoundException(`Experience with ID "${id}" not found`);
    }

    return updatedExperience;
  }

  async remove(id: string) {
    this.validateObjectId(id);

    const deletedExperience = await this.experienceModel
      .findByIdAndDelete(id)
      .lean({ virtuals: true })
      .exec();

    if (!deletedExperience) {
      throw new NotFoundException(`Experience with ID "${id}" not found`);
    }

    return {
      message: `Experience with ID "${id}" successfully deleted`,
      id,
    };
  }

  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Invalid ID format: "${id}"`);
    }
  }
}
