import { Injectable } from '@nestjs/common';
import { CaseStudiesService } from '../case-studies/case-studies.service';
import { CategoriesService } from '../categories/categories.service';
import { ContactsService } from '../contacts/contacts.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly caseStudiesService: CaseStudiesService,
    private readonly categoriesService: CategoriesService,
    private readonly contactsService: ContactsService,
  ) {}

  async getCounts() {
    const [caseStudies, techStacks, messages] = await Promise.all([
      this.caseStudiesService.count(),
      this.categoriesService.count(),
      this.contactsService.count(),
    ]);

    return {
      caseStudies,
      techStacks,
      messages,
    };
  }
}
