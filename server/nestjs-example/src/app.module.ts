import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChainsModule } from './chains/chains.module';
import { QuotesAndRoutesModule } from './quotes-and-routes/quotes-and-routes.module';
import { IntentsModule } from './intents/intents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ChainsModule,
    QuotesAndRoutesModule,
    IntentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
