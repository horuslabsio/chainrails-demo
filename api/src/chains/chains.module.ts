import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChainsService } from './chains.service';
import { ChainsController } from './chains.controller';

@Module({
  imports: [ConfigModule],
  controllers: [ChainsController],
  providers: [ChainsService],
  exports: [ChainsService],
})
export class ChainsModule {}
