import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CaseStudiesService } from './case-studies.service';
import { CreateCaseStudyDto } from './dto/create-case-study.dto';
import { QueryCaseStudyDto } from './dto/query-case-study.dto';
import { UpdateCaseStudyDto } from './dto/update-case-study.dto';

@Controller('case-studies')
export class CaseStudiesController {
  constructor(private readonly caseStudiesService: CaseStudiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCaseStudyDto: CreateCaseStudyDto) {
    return this.caseStudiesService.create(createCaseStudyDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() queryDto: QueryCaseStudyDto) {
    return this.caseStudiesService.findAll(queryDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.caseStudiesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateCaseStudyDto: UpdateCaseStudyDto,
  ) {
    return this.caseStudiesService.update(id, updateCaseStudyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.caseStudiesService.remove(id);
  }
}
