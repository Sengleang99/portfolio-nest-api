import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreateCaseStudyDto } from './dto/create-case-study.dto';
import { QueryCaseStudyDto } from './dto/query-case-study.dto';
import { UpdateCaseStudyDto } from './dto/update-case-study.dto';
import { CaseStudy, CaseStudyDocument } from './schemas/case-study.schema';

@Injectable()
export class CaseStudiesService {
  constructor(
    @InjectModel(CaseStudy.name)
    private readonly caseStudyModel: Model<CaseStudyDocument>,
  ) {}

  async create(createCaseStudyDto: CreateCaseStudyDto): Promise<CaseStudy> {
    const createdCaseStudy = new this.caseStudyModel(createCaseStudyDto);
    return createdCaseStudy.save();
  }

  async findAll(queryDto: QueryCaseStudyDto) {
    const { page = 1, limit = 10, search, tag } = queryDto;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (tag) {
      filter.tag = { $regex: tag, $options: 'i' };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tag: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { longDescription: { $regex: search, $options: 'i' } },
        { tech: { $regex: search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.caseStudyModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true })
        .exec(),
      this.caseStudyModel.countDocuments(filter).exec(),
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

    const caseStudy = await this.caseStudyModel
      .findById(id)
      .lean({ virtuals: true })
      .exec();

    if (!caseStudy) {
      throw new NotFoundException(`Case study with ID "${id}" not found`);
    }

    return caseStudy;
  }

  async update(id: string, updateCaseStudyDto: UpdateCaseStudyDto) {
    this.validateObjectId(id);

    const updatedCaseStudy = await this.caseStudyModel
      .findByIdAndUpdate(id, updateCaseStudyDto, {
        new: true,
        runValidators: true,
      })
      .lean({ virtuals: true })
      .exec();

    if (!updatedCaseStudy) {
      throw new NotFoundException(`Case study with ID "${id}" not found`);
    }

    return updatedCaseStudy;
  }

  async remove(id: string) {
    this.validateObjectId(id);

    const deletedCaseStudy = await this.caseStudyModel
      .findByIdAndDelete(id)
      .lean({ virtuals: true })
      .exec();

    if (!deletedCaseStudy) {
      throw new NotFoundException(`Case study with ID "${id}" not found`);
    }

    return {
      message: `Case study with ID "${id}" successfully deleted`,
      id,
    };
  }

  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Invalid ID format: "${id}"`);
    }
  }
}
