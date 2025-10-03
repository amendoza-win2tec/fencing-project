import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FencingModule } from './fencing/fencing.module';
import { WrestlingModule } from './wrestling/wrestling.module';

@Module({
  imports: [ConfigModule.forRoot(), FencingModule, WrestlingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

