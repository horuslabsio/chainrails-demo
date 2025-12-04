import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QuotesAndRoutesService } from './quotes-and-routes.service';
import { QuotesAndRoutesController } from './quotes-and-routes.controller';

@Module({
  imports: [ConfigModule],
  controllers: [QuotesAndRoutesController],
  providers: [QuotesAndRoutesService],
  exports: [QuotesAndRoutesService],
})
export class QuotesAndRoutesModule {}
