import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IntentsService } from './intents.service';
import { IntentsController } from './intents.controller';

@Module({
  imports: [ConfigModule],
  controllers: [IntentsController],
  providers: [IntentsService],
  exports: [IntentsService],
})
export class IntentsModule {}
