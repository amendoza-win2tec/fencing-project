import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FencingModule } from './fencing/fencing.module';

@Module({
  imports: [ConfigModule.forRoot(), FencingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

