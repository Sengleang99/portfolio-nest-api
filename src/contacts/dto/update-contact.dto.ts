import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateContactDto } from './create-contact.dto';

export class UpdateContactDto extends PartialType(CreateContactDto) {
  @IsEnum(['read', 'unread'])
  @IsOptional()
  status?: 'read' | 'unread';
}
