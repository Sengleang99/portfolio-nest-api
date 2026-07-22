import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreateEducationDto } from './dto/create-education.dto';
import { QueryEducationDto } from './dto/query-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { Education, EducationDocument } from './schemas/education.schema';

@Injectable()
export class EducationsService {
  constructor(
    @InjectModel(Education.name)
    private readonly educationModel: Model<EducationDocument>,
  ) {}

  async create(createEducationDto: CreateEducationDto): Promise<Education> {
    const createdEducation = new this.educationModel(createEducationDto);
    return createdEducation.save();
  }

  async findAll(queryDto: QueryEducationDto) {
    const { page = 1, limit = 10, search } = queryDto;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { degree: { $regex: search, $options: 'i' } },
        { major: { $regex: search, $options: 'i' } },
        { university: { $regex: search, $options: 'i' } },
        { descr: { $regex: search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.educationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true })
        .exec(),
      this.educationModel.countDocuments(filter).exec(),
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

    const education = await this.educationModel
      .findById(id)
      .lean({ virtuals: true })
      .exec();

    if (!education) {
      throw new NotFoundException(`Education with ID "${id}" not found`);
    }

    return education;
  }

  async update(id: string, updateEducationDto: UpdateEducationDto) {
    this.validateObjectId(id);

    const updatedEducation = await this.educationModel
      .findByIdAndUpdate(id, updateEducationDto, {
        new: true,
        runValidators: true,
      })
      .lean({ virtuals: true })
      .exec();

    if (!updatedEducation) {
      throw new NotFoundException(`Education with ID "${id}" not found`);
    }

    return updatedEducation;
  }

  async remove(id: string) {
    this.validateObjectId(id);

    const deletedEducation = await this.educationModel
      .findByIdAndDelete(id)
      .lean({ virtuals: true })
      .exec();

    if (!deletedEducation) {
      throw new NotFoundException(`Education with ID "${id}" not found`);
    }

    return {
      message: `Education with ID "${id}" successfully deleted`,
    };
  }

  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Invalid ID format: "${id}"`);
    }
  }
}
