import { Injectable } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { Participant, ParticipantSearchFilters } from '../../domain/interfaces/participant.interfaces';

@Injectable()
export class ParticipantLookupUtil {
  constructor(private readonly participantService: ParticipantService) {}

  /**
   * Quick lookup by any identifier (tries ID, code, name in order)
   */
  quickLookup(identifier: string): Participant | null {
    // Try by ID first
    let result = this.participantService.getById(identifier);
    if (result.participant) return result.participant;

    // Try by code
    result = this.participantService.getByCode(identifier);
    if (result.participant) return result.participant;

    // Try by name (first match)
    const byName = this.participantService.getByName(identifier);
    if (byName.length > 0) return byName[0];

    return null;
  }

  /**
   * Find participants by partial name match
   */
  findByPartialName(partialName: string): Participant[] {
    const allParticipants = this.participantService.getAll();
    const searchTerm = partialName.toLowerCase();
    
    return allParticipants.filter(participant => 
      participant.name.toLowerCase().includes(searchTerm) ||
      participant.surname.toLowerCase().includes(searchTerm) ||
      `${participant.name} ${participant.surname}`.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Find participants by organisation with name search
   */
  findByOrganisationAndName(organisationCode: string, nameSearch?: string): Participant[] {
    let participants = this.participantService.getByOrganisation(organisationCode);
    
    if (nameSearch) {
      const searchTerm = nameSearch.toLowerCase();
      participants = participants.filter(participant => 
        participant.name.toLowerCase().includes(searchTerm) ||
        participant.surname.toLowerCase().includes(searchTerm)
      );
    }
    
    return participants;
  }

  /**
   * Get participants by multiple codes
   */
  getByCodes(codes: string[]): Participant[] {
    return codes
      .map(code => this.participantService.getByCode(code))
      .filter(result => result.participant !== null)
      .map(result => result.participant!);
  }

  /**
   * Get participants by multiple IDs
   */
  getByIds(ids: string[]): Participant[] {
    return ids
      .map(id => this.participantService.getById(id))
      .filter(result => result.participant !== null)
      .map(result => result.participant!);
  }

  /**
   * Advanced search with multiple criteria
   */
  advancedSearch(criteria: {
    name?: string;
    surname?: string;
    code?: string;
    organisation?: string;
    gender?: string;
    function?: string;
    partialName?: string;
  }): Participant[] {
    const filters: ParticipantSearchFilters = {};
    
    if (criteria.name) filters.name = criteria.name;
    if (criteria.surname) filters.surname = criteria.surname;
    if (criteria.code) filters.code = criteria.code;
    if (criteria.organisation) filters.organisation = criteria.organisation;
    if (criteria.gender) filters.gender = criteria.gender;
    if (criteria.function) filters.function = criteria.function;

    let results = this.participantService.search(filters).participants;

    // Apply partial name search if specified
    if (criteria.partialName) {
      const searchTerm = criteria.partialName.toLowerCase();
      results = results.filter(participant => 
        participant.name.toLowerCase().includes(searchTerm) ||
        participant.surname.toLowerCase().includes(searchTerm)
      );
    }

    return results;
  }

  /**
   * Get participants grouped by organisation
   */
  getGroupedByOrganisation(): { [organisationCode: string]: Participant[] } {
    const allParticipants = this.participantService.getAll();
    const grouped: { [organisationCode: string]: Participant[] } = {};

    allParticipants.forEach(participant => {
      const orgCode = participant.organisation.code;
      if (!grouped[orgCode]) {
        grouped[orgCode] = [];
      }
      grouped[orgCode].push(participant);
    });

    return grouped;
  }

  /**
   * Get participants grouped by gender
   */
  getGroupedByGender(): { [genderCode: string]: Participant[] } {
    const allParticipants = this.participantService.getAll();
    const grouped: { [genderCode: string]: Participant[] } = {};

    allParticipants.forEach(participant => {
      const genderCode = participant.gender.code;
      if (!grouped[genderCode]) {
        grouped[genderCode] = [];
      }
      grouped[genderCode].push(participant);
    });

    return grouped;
  }

  /**
   * Find similar participants (same name or surname)
   */
  findSimilar(participant: Participant): Participant[] {
    const allParticipants = this.participantService.getAll();
    
    return allParticipants.filter(p => 
      p.idParticipant !== participant.idParticipant && (
        p.name.toLowerCase() === participant.name.toLowerCase() ||
        p.surname.toLowerCase() === participant.surname.toLowerCase()
      )
    );
  }

  /**
   * Get participants with missing or incomplete data
   */
  getIncompleteParticipants(): Participant[] {
    const allParticipants = this.participantService.getAll();
    
    return allParticipants.filter(participant => 
      !participant.name || 
      !participant.surname || 
      !participant.code || 
      !participant.organisation.code ||
      !participant.gender.code
    );
  }

  /**
   * Get participants by name pattern (supports wildcards)
   */
  getByNamePattern(pattern: string): Participant[] {
    const allParticipants = this.participantService.getAll();
    const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i');
    
    return allParticipants.filter(participant => 
      regex.test(participant.name) || 
      regex.test(participant.surname) ||
      regex.test(`${participant.name} ${participant.surname}`)
    );
  }
}
