import { Controller, Post, Body, BadRequestException, Req, RawBodyRequest, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Request } from 'express';
import { FencingService } from '../../application/fencing.app.service';
import { 
  FencingCompetition, 
  FencingProcessResponse, 
  FencingErrorResponse, 
  ApiResponse,
  MqttFencingData,
  MqttMatchData,
  MqttFencerData
} from '../../domain/interfaces/fencing.interfaces';
import * as xml2js from 'xml2js';

@Controller('fencing')
export class FencingController {
  private readonly logger = new Logger(FencingController.name);

  constructor(@InjectQueue('fen-mim') private readonly fenMiMQueue: Queue, 
  private readonly fencingService: FencingService) {}

  @Post('process-xml')
  async processFencingXml(@Req() req: RawBodyRequest<Request>): Promise<FencingProcessResponse> {
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

      const xmlJson: FencingCompetition = await parser.parseStringPromise(xmlContent);

      // Process the fencing fights
      const result = await this.fencingService.processFencingFights(xmlJson);

      return {
        success: true,
        data: result,
        message: 'Fencing XML processed successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Error processing XML: ${error.message}`);
    }
  }

  @Post('process-file')
  async processFencingFile(@Body() body: { xmlFile: string }) {
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

      // Process the fencing fights
      const result = this.fencingService.processFencingFights(xmlJson);

      return {
        success: true,
        data: result,
        message: 'Fencing XML file processed successfully',
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

      const xmlJson: FencingCompetition = await parser.parseStringPromise(xmlContent);

      // Send raw Poules data to API
      const result = await this.fencingService.sendRawPoulesToApi(xmlJson);

      return result;
    } catch (error) {
      throw new BadRequestException(`Error sending poules to API: ${error.message}`);
    }
  }

  @Post('test-mqtt-data')
  async testMqttData(@Body() body: MqttFencingData): Promise<{ success: boolean; message: string; data?: MqttMatchData }> {
    try {
      this.logger.log('Testing MQTT data processing');
      
      // Transform MQTT data to structured format
      const matchData = this.transformMqttData(body.DataDic);
      
      this.logger.log(`Test match data: ${JSON.stringify(matchData, null, 2)}`);
      
      return {
        success: true,
        message: 'MQTT data processed successfully',
        data: matchData
      };
    } catch (error) {
      this.logger.error(`Error testing MQTT data: ${error.message}`);
      throw new BadRequestException(`Error testing MQTT data: ${error.message}`);
    }
  }

    // Use # to match any topic
  //@MessagePattern('fen/#')
  @MessagePattern('TSOVR/FEN/RT/#')
  async handleJudData(@Payload() payload: MqttFencingData): Promise<void> {
    try {
      this.logger.log('Received TKW data from MQTT topic');
      this.logger.debug(`MQTT Payload: ${JSON.stringify(payload, null, 2)}`);
      
      // Transform MQTT data to structured format
      const matchData = this.transformMqttData(payload.DataDic);
      this.logger.log(`Processing match ${matchData.match} - ${matchData.rightFencer.name} vs ${matchData.leftFencer.name}`);
      
      await this.fencingService.parseIndividualCompetition(matchData);
      this.logger.log('Successfully processed TKW data from MQTT');
    } catch (error) {
      this.logger.error(`Error handling TKW MQTT data: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Transform MQTT data structure to a more usable format
   */
  private transformMqttData(mqttData: MqttFencingData['DataDic']): MqttMatchData {
    const data = mqttData;
    
    return {
      protocol: data.Protocol,
      communication: data.Com,
      piste: data.Piste,
      competition: data.Compe,
      phase: data.Phase,
      pouleTable: data.PoulTab,
      match: data.Match,
      round: data.Round,
      time: data.Time,
      stopwatch: data.Stopwatch,
      type: data.Type,
      weapon: data.Weapon,
      priority: data.Priority,
      state: data.State,
      rightFencer: {
        id: data.RightId,
        name: data.RightName,
        nationality: data.RightNat,
        score: data.Rscore,
        status: data.Rstatus,
        yellowCard: data.RYcard,
        redCard: data.RRcard,
        light: data.RLight,
        weaponLight: data.RWlight,
        medical: data.RMedical,
        reserve: data.RReserve,
        pCard: data.RPcard
      },
      leftFencer: {
        id: data.LeftId,
        name: data.LeftName,
        nationality: data.LeftNat,
        score: data.Lscore,
        status: data.Lstatus,
        yellowCard: data.LYcard,
        redCard: data.LRcard,
        light: data.LLight,
        weaponLight: data.LWlight,
        medical: data.LMedical,
        reserve: data.LReserve,
        pCard: data.LPcard
      }
    };
  }
}

