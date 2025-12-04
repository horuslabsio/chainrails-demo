import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChainsModule } from './chains/chains.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ChainsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
