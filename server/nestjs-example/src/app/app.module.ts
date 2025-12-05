import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { ChainsModule } from '../chains/chains.module';
import { QuotesAndRoutesModule } from '../quotes-and-routes/quotes-and-routes.module';
import { IntentsModule } from '../intents/intents.module';

@Module({
  imports: [
    ChainsModule,
    QuotesAndRoutesModule,
    IntentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
