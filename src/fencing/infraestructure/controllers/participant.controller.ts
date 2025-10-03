import { Controller, Get, Query, Param, Logger } from '@nestjs/common';
import { ParticipantService } from '../shared/participant.service';
import { ParticipantSearchFilters } from '../../domain/interfaces/participant.interfaces';

@Controller('participants')
export class ParticipantController {
  private readonly logger = new Logger(ParticipantController.name);

  constructor(private readonly participantService: ParticipantService) {}

  /**
   * Get all participants
   */
  @Get()
  getAllParticipants() {
    this.logger.log('Getting all participants');
    return {
      participants: this.participantService.getAll(),
      total: this.participantService.getTotalCount()
    };
  }

  /**
   * Get participant by ID
   */
  @Get('id/:id')
  getParticipantById(@Param('id') id: string) {
    this.logger.log(`Getting participant by ID: ${id}`);
    const result = this.participantService.getById(id);
    return result;
  }

  /**
   * Get participant by code
   */
  @Get('code/:code')
  getParticipantByCode(@Param('code') code: string) {
    this.logger.log(`Getting participant by code: ${code}`);
    const result = this.participantService.getByCode(code);
    return result;
  }

  /**
   * Get participants by name
   */
  @Get('name/:name')
  getParticipantsByName(@Param('name') name: string) {
    this.logger.log(`Getting participants by name: ${name}`);
    return this.participantService.getByName(name);
  }

  /**
   * Get participants by surname
   */
  @Get('surname/:surname')
  getParticipantsBySurname(@Param('surname') surname: string) {
    this.logger.log(`Getting participants by surname: ${surname}`);
    return this.participantService.getBySurname(surname);
  }

  /**
   * Get participants by full name
   */
  @Get('fullname/:name/:surname')
  getParticipantsByFullName(
    @Param('name') name: string,
    @Param('surname') surname: string
  ) {
    this.logger.log(`Getting participants by full name: ${name} ${surname}`);
    return this.participantService.getByFullName(name, surname);
  }

  /**
   * Get participants by organisation
   */
  @Get('organisation/:organisation')
  getParticipantsByOrganisation(@Param('organisation') organisation: string) {
    this.logger.log(`Getting participants by organisation: ${organisation}`);
    return this.participantService.getByOrganisation(organisation);
  }

  /**
   * Get participants by organisation with statistics
   */
  @Get('organisation/:organisation/stats')
  getParticipantsByOrganisationWithStats(@Param('organisation') organisation: string) {
    this.logger.log(`Getting participants by organisation with stats: ${organisation}`);
    return this.participantService.getByOrganisationWithStats(organisation);
  }

  /**
   * Get participants by gender
   */
  @Get('gender/:gender')
  getParticipantsByGender(@Param('gender') gender: string) {
    this.logger.log(`Getting participants by gender: ${gender}`);
    return this.participantService.getByGender(gender);
  }

  /**
   * Search participants with filters
   */
  @Get('search')
  searchParticipants(@Query() filters: ParticipantSearchFilters) {
    this.logger.log(`Searching participants with filters:`, filters);
    return this.participantService.search(filters);
  }

  /**
   * Get all organisation codes
   */
  @Get('organisations')
  getOrganisationCodes() {
    this.logger.log('Getting all organisation codes');
    return this.participantService.getOrganisationCodes();
  }

  /**
   * Get all gender codes
   */
  @Get('genders')
  getGenderCodes() {
    this.logger.log('Getting all gender codes');
    return this.participantService.getGenderCodes();
  }

  /**
   * Get statistics about participants
   */
  @Get('statistics')
  getStatistics() {
    this.logger.log('Getting participant statistics');
    return this.participantService.getStatistics();
  }
}
