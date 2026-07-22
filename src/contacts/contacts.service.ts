import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreateContactDto } from './dto/create-contact.dto';
import { QueryContactDto } from './dto/query-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact, ContactDocument } from './schemas/contact.schema';

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(Contact.name)
    private readonly contactModel: Model<ContactDocument>,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const createdContact = new this.contactModel(createContactDto);
    return createdContact.save();
  }

  async findAll(queryDto: QueryContactDto) {
    const { page = 1, limit = 10, search } = queryDto;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.contactModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true })
        .exec(),
      this.contactModel.countDocuments(filter).exec(),
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

    const contact = await this.contactModel
      .findById(id)
      .lean({ virtuals: true })
      .exec();

    if (!contact) {
      throw new NotFoundException(`Contact message with ID "${id}" not found`);
    }

    return contact;
  }

  async update(id: string, updateContactDto: UpdateContactDto) {
    this.validateObjectId(id);

    const updatedContact = await this.contactModel
      .findByIdAndUpdate(id, updateContactDto, {
        new: true,
        runValidators: true,
      })
      .lean({ virtuals: true })
      .exec();

    if (!updatedContact) {
      throw new NotFoundException(`Contact message with ID "${id}" not found`);
    }

    return updatedContact;
  }

  async remove(id: string) {
    this.validateObjectId(id);

    const deletedContact = await this.contactModel
      .findByIdAndDelete(id)
      .lean({ virtuals: true })
      .exec();

    if (!deletedContact) {
      throw new NotFoundException(`Contact message with ID "${id}" not found`);
    }

    return {
      message: `Contact message with ID "${id}" successfully deleted`,
      id,
    };
  }

  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Invalid ID format: "${id}"`);
    }
  }
}
