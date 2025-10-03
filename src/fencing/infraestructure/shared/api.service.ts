import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { Poule } from '../../domain/interfaces/fencing.interfaces';
import { CreateStartListDto } from 'src/fencing/domain/interfaces/fencing-participant.interfaces';
import { CreateResultDto } from 'src/fencing/domain/interfaces/fencing-results.interface';

export interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export interface PoulesApiRequest {
  competitionId: string;
  poules: Poule[];
  metadata: {
    competitionName: string;
    date: string;
    weapon: string;
    gender: string;
  };
}

@Injectable()
export class ApiService {
  private readonly logger = new Logger(ApiService.name);
  private readonly apiBaseUrl: string;
  private readonly apiKey: string;
  private readonly mqttUser: string;
  private readonly mqttPassword: string;
  private readonly mqttHost: string;

  constructor(private readonly configService: ConfigService) {
    this.apiBaseUrl = this.configService.get<string>('API_BASE_URL') || 'http://localhost:3020/api';
    this.apiKey = this.configService.get<string>('API_KEY') || '';
    this.mqttUser = this.configService.get<string>('MQTT_URI') || '';
    this.mqttPassword = this.configService.get<string>('MQTT_PASSWORD') || '';
    this.mqttHost = this.configService.get<string>('MQTT_HOST') || '';
  }

  /**
   * Send raw Poules data to external API
   */
  async sendPoulesData(request: PoulesApiRequest): Promise<ApiResponse> {
    try {
      this.logger.log(`Sending poules data for competition: ${request.competitionId}`);
      
      const response: AxiosResponse = await axios.put(
        `${this.apiBaseUrl}/unit/raw-update`,
        {...request},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'X-API-Version': '1.0',
          },
          timeout: 10000, // 10 seconds timeout
        }
      );

      this.logger.log(`Successfully sent poules data. Status: ${response.status}`);
      
      return {
        success: true,
        data: response.data,
        message: 'Poules data sent successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to send poules data: ${error.message}`);
      
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.message,
          message: `API Error: ${error.response?.status} - ${error.response?.statusText}`,
        };
      }
      
      return {
        success: false,
        error: error.message,
        message: 'Unknown error occurred while sending data',
      };
    }
  }

  /**
   * Send individual Poule data
   */
  async sendPouleData(poule: Poule): Promise<ApiResponse> {
    try {
      this.logger.log(`Sending poule ${poule.ID}`);
      
      const response: AxiosResponse = await axios.put(
        `${this.apiBaseUrl}/unit/raw-update`,
        {
          ...poule,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'X-API-Version': '1.0',
          },
          timeout: 15000, // 15 seconds timeout
        }
      );

      this.logger.log(`Successfully sent poule ${poule.ID} data. Status: ${response.status}`);
      
      return {
        success: true,
        data: response.data,
        message: `Poule ${poule.ID} data sent successfully`,
      };
    } catch (error) {
      this.logger.error(`Failed to send poule ${poule.ID} data: ${error.message}`);
      
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.message,
          message: `API Error: ${error.response?.status} - ${error.response?.statusText}`,
        };
      }
      
      return {
        success: false,
        error: error.message,
        message: `Unknown error occurred while sending poule ${poule.ID} data`,
      };
    }
  }

  async sendStartListData(startList: CreateStartListDto): Promise<ApiResponse> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.apiBaseUrl}/start-list/create`,
        {
          ...startList,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'X-API-Version': '1.0',
          },
          timeout: 15000, // 15 seconds timeout
        }
      );
      return {
        success: true,
        data: response.data,
        message: `Poule start list data sent successfully`,
      };
    } catch (error) {
      this.logger.error(`Failed to send poule start list data: ${error.message}`);
      
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.message,
          message: `API Error: ${error.response?.status} - ${error.response?.statusText}`,
        };
      }
      
      return {
        success: false,
        error: error.message,
        message: `Unknown error occurred while sending poule start list data`,
      };
    }
  }

  async sendResultData(result: CreateResultDto): Promise<ApiResponse> {
    try {
      const response: AxiosResponse = await axios.put(
        `${this.apiBaseUrl}/result/update`,
        {
          ...result,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'X-API-Version': '1.0',
          },
          timeout: 15000, // 15 seconds timeout
        }
      );
      return {
        success: true,
        data: response.data,
        message: `Poule result data sent successfully`,
      };
    } catch (error) {
      this.logger.error(`Failed to send poule result data: ${error.message}`);
      
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.message,
          message: `API Error: ${error.response?.status} - ${error.response?.statusText}`,
        };
      }
      
      return {
        success: false,
        error: error.message,
        message: `Unknown error occurred while sending poule result data`,
      };
    }
  }
  /**
   * Health check for the external API
   */
  async checkApiHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/health`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      this.logger.warn(`API health check failed: ${error.message}`);
      return false;
    }
  }
}