import { Controller, Post, Body, BadRequestException, Req, RawBodyRequest, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Request } from 'express';
import { WrestlingService } from '../../application/wrestling.app.service';
import { 
  WrestlingCompetition, 
  WrestlingProcessResponse, 
  WrestlingErrorResponse, 
  ApiResponse,
  MqttWrestlingData,
  MqttMatchData,
  MqttWrestlerData,
  WrestlingXmlData
} from '../../domain/interfaces/wrestling.interfaces';
import * as xml2js from 'xml2js';

@Controller('wrestling')
export class WrestlingController {
  private readonly logger = new Logger(WrestlingController.name);

  constructor(@InjectQueue('wrestling-mim') private readonly wrestlingMiMQueue: Queue, 
  private readonly wrestlingService: WrestlingService) {}

  @Post('process-xml')
  async processWrestlingXml(@Req() req: RawBodyRequest<Request>): Promise<WrestlingProcessResponse> {
    try {

      this.logger.log('Processing wrestling XML schedule...');

      // Parse XML to JSON with proper configuration for wrestling XML
      const xmlContent = req.body;

      // const xmlJson: WrestlingXmlData = await parser.parseStringPromise(xmlContent);
      
      // this.logger.log(`Parsed XML with ${xmlJson.OdfBody.Competition.Session.length} sessions`);

      // Process the wrestling schedule data
      const result = await this.wrestlingService.processWrestlingSchedule(xmlContent);

      return {
        success: true,
        data: result,
        message: 'Wrestling XML schedule processed successfully',
      };
    } catch (error) {
      this.logger.error(`Error processing wrestling XML: ${error.message}`);
      throw new BadRequestException(`Error processing XML: ${error.message}`);
    }
  }

  @Post('process-file')
  async processWrestlingFile(@Body() body: { xmlFile: string }) {
    try {
      if (!body.xmlFile) {
        throw new BadRequestException('XML file content is required');
      }

      // Parse XML to JSON
      const parser = new xml2js.Parser({
        explicitArray: false,
        mergeAttrs: true,
        explicitRoot: false,
      });

      const xmlJson = await parser.parseStringPromise(body.xmlFile);

      // Process the wrestling fights
      const result = this.wrestlingService.processWrestlingFights(xmlJson);

      return {
        success: true,
        data: result,
        message: 'Wrestling XML file processed successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Error processing XML file: ${error}`);
    }
  }

  @Post('send-poules')
  async sendRawPoulesToApi(@Req() req: RawBodyRequest<Request>): Promise<ApiResponse> {
    try {
      // Get XML content from raw body
      const xmlContent = req.body?.toString('utf8');
      
      if (!xmlContent) {
        throw new BadRequestException('XML content is required');
      }

      // Parse XML to JSON
      const parser = new xml2js.Parser({
        explicitArray: false,
        mergeAttrs: true,
        explicitRoot: false,
      });

      const xmlJson: WrestlingCompetition = await parser.parseStringPromise(xmlContent);

      // Send raw Poules data to API
      const result = await this.wrestlingService.sendRawPoulesToApi(xmlJson);

      return result;
    } catch (error) {
      throw new BadRequestException(`Error sending poules to API: ${error.message}`);
    }
  }
}
