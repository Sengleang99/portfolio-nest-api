import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { Contact, ContactSchema } from './schemas/contact.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Contact.name, schema: ContactSchema }]),
    AuthModule,
  ],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
