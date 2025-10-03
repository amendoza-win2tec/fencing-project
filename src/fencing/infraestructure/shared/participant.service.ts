import { Injectable, Logger } from '@nestjs/common';
import { Participant, ParticipantLookupResult, ParticipantSearchFilters, ParticipantSearchResult } from '../../domain/interfaces/participant.interfaces';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ParticipantService {
  private readonly logger = new Logger(ParticipantService.name);
  private readonly participants: Participant[] = this.loadParticipants();
  
  // Indexes for fast lookups
  private readonly byIdIndex: Map<string, number> = new Map();
  private readonly byCodeIndex: Map<string, number> = new Map();
  private readonly byNameIndex: Map<string, number[]> = new Map();
  private readonly bySurnameIndex: Map<string, number[]> = new Map();
  private readonly byOrganisationIndex: Map<string, number[]> = new Map();
  private readonly byGenderIndex: Map<string, number[]> = new Map();

  constructor() {
    if (!this.participants || this.participants.length === 0) {
      this.logger.error('No participants data loaded');
      throw new Error('Failed to load participants data');
    }
    this.buildIndexes();
  }

  /**
   * Load participants data from JSON file
   */
  private loadParticipants(): Participant[] {
    try {
      // Try to load from source directory first
      const sourcePath = path.join(__dirname, 'participants.json');
      if (fs.existsSync(sourcePath)) {
        const data = fs.readFileSync(sourcePath, 'utf8');
        return JSON.parse(data) as Participant[];
      }

      // Try to load from project root
      const rootPath = path.join(process.cwd(), 'src', 'fencing', 'infraestructure', 'shared', 'participants.json');
      if (fs.existsSync(rootPath)) {
        const data = fs.readFileSync(rootPath, 'utf8');
        return JSON.parse(data) as Participant[];
      }

      // Try to load from dist directory
      const distPath = path.join(__dirname, '..', '..', '..', '..', 'src', 'fencing', 'infraestructure', 'shared', 'participants.json');
      if (fs.existsSync(distPath)) {
        const data = fs.readFileSync(distPath, 'utf8');
        return JSON.parse(data) as Participant[];
      }

      this.logger.error('Participants JSON file not found in any expected location');
      throw new Error('Participants JSON file not found');
    } catch (error) {
      this.logger.error(`Error loading participants data: ${error.message}`);
      throw new Error(`Failed to load participants data: ${error.message}`);
    }
  }

  /**
   * Build indexes for fast lookups
   */
  private buildIndexes(): void {
    this.logger.log(`Building indexes for ${this.participants.length} participants`);
    
    this.participants.forEach((participant, index) => {
      // ID index (unique)
      this.byIdIndex.set(participant.idParticipant, index);
      
      // Code index (unique)
      this.byCodeIndex.set(participant.code, index);
      
      // Name index (multiple entries possible)
      const nameKey = participant.name.toLowerCase();
      if (!this.byNameIndex.has(nameKey)) {
        this.byNameIndex.set(nameKey, []);
      }
      this.byNameIndex.get(nameKey)!.push(index);
      
      // Surname index (multiple entries possible)
      const surnameKey = participant.surname.toLowerCase();
      if (!this.bySurnameIndex.has(surnameKey)) {
        this.bySurnameIndex.set(surnameKey, []);
      }
      this.bySurnameIndex.get(surnameKey)!.push(index);
      
      // Organisation index (multiple entries possible)
      const orgKey = participant.organisation.code;
      if (!this.byOrganisationIndex.has(orgKey)) {
        this.byOrganisationIndex.set(orgKey, []);
      }
      this.byOrganisationIndex.get(orgKey)!.push(index);
      
      // Gender index (multiple entries possible)
      const genderKey = participant.gender.code;
      if (!this.byGenderIndex.has(genderKey)) {
        this.byGenderIndex.set(genderKey, []);
      }
      this.byGenderIndex.get(genderKey)!.push(index);
    });
    
    this.logger.log('Indexes built successfully');
  }

  /**
   * Get participant by ID
   */
  getById(id: string): ParticipantLookupResult {
    const index = this.byIdIndex.get(id);
    if (index !== undefined) {
      return {
        participant: this.participants[index],
        index
      };
    }
    return { participant: null, index: -1 };
  }

  /**
   * Get participant by code
   */
  getByCode(code: string): ParticipantLookupResult {
    const index = this.byCodeIndex.get(code);
    if (index !== undefined) {
      return {
        participant: this.participants[index],
        index
      };
    }
    return { participant: null, index: -1 };
  }

  /**
   * Get participants by name (case-insensitive)
   */
  getByName(name: string): Participant[] {
    const nameKey = name.toLowerCase();
    const indices = this.byNameIndex.get(nameKey) || [];
    return indices.map(index => this.participants[index]);
  }

  /**
   * Get participants by surname (case-insensitive)
   */
  getBySurname(surname: string): Participant[] {
    const surnameKey = surname.toLowerCase();
    const indices = this.bySurnameIndex.get(surnameKey) || [];
    return indices.map(index => this.participants[index]);
  }

  /**
   * Get participants by full name (case-insensitive)
   */
  getByFullName(name: string, surname: string): Participant[] {
    const nameKey = name.toLowerCase();
    const surnameKey = surname.toLowerCase();
    
    const nameIndices = this.byNameIndex.get(nameKey) || [];
    const surnameIndices = this.bySurnameIndex.get(surnameKey) || [];
    
    // Find intersection of both indices
    const commonIndices = nameIndices.filter(index => surnameIndices.includes(index));
    return commonIndices.map(index => this.participants[index]);
  }

  /**
   * Get participants by organisation code
   */
  getByOrganisation(organisationCode: string): Participant[] {
    const indices = this.byOrganisationIndex.get(organisationCode) || [];
    return indices.map(index => this.participants[index]);
  }

  /**
   * Get participants by gender
   */
  getByGender(genderCode: string): Participant[] {
    const indices = this.byGenderIndex.get(genderCode) || [];
    return indices.map(index => this.participants[index]);
  }

  /**
   * Search participants with multiple filters
   */
  search(filters: ParticipantSearchFilters): ParticipantSearchResult {
    let indices: number[] = [];
    let isFirstFilter = true;

    // Apply name filter
    if (filters.name) {
      const nameKey = filters.name.toLowerCase();
      const nameIndices = this.byNameIndex.get(nameKey) || [];
      indices = isFirstFilter ? nameIndices : indices.filter(index => nameIndices.includes(index));
      isFirstFilter = false;
    }

    // Apply surname filter
    if (filters.surname) {
      const surnameKey = filters.surname.toLowerCase();
      const surnameIndices = this.bySurnameIndex.get(surnameKey) || [];
      indices = isFirstFilter ? surnameIndices : indices.filter(index => surnameIndices.includes(index));
      isFirstFilter = false;
    }

    // Apply code filter (exact match)
    if (filters.code) {
      const codeIndex = this.byCodeIndex.get(filters.code);
      if (codeIndex !== undefined) {
        indices = isFirstFilter ? [codeIndex] : indices.filter(index => index === codeIndex);
      } else {
        indices = [];
      }
      isFirstFilter = false;
    }

    // Apply organisation filter
    if (filters.organisation) {
      const orgIndices = this.byOrganisationIndex.get(filters.organisation) || [];
      indices = isFirstFilter ? orgIndices : indices.filter(index => orgIndices.includes(index));
      isFirstFilter = false;
    }

    // Apply gender filter
    if (filters.gender) {
      const genderIndices = this.byGenderIndex.get(filters.gender) || [];
      indices = isFirstFilter ? genderIndices : indices.filter(index => genderIndices.includes(index));
      isFirstFilter = false;
    }

    // Apply function filter (no index for this, so filter manually)
    if (filters.function) {
      indices = indices.filter(index => 
        this.participants[index].function.toLowerCase() === filters.function!.toLowerCase()
      );
    }

    // If no filters applied, return all participants
    if (isFirstFilter) {
      indices = Array.from({ length: this.participants.length }, (_, i) => i);
    }

    const participants = indices.map(index => this.participants[index]);

    return {
      participants,
      total: participants.length,
      filters
    };
  }

  /**
   * Get all participants
   */
  getAll(): Participant[] {
    return [...this.participants];
  }

  /**
   * Get total count of participants
   */
  getTotalCount(): number {
    return this.participants.length;
  }

  /**
   * Get participants by organisation with statistics
   */
  getByOrganisationWithStats(organisationCode: string): {
    participants: Participant[];
    total: number;
    genderBreakdown: { [key: string]: number };
  } {
    const participants = this.getByOrganisation(organisationCode);
    const genderBreakdown = participants.reduce((acc, participant) => {
      const gender = participant.gender.code;
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return {
      participants,
      total: participants.length,
      genderBreakdown
    };
  }

  /**
   * Get all unique organisation codes
   */
  getOrganisationCodes(): string[] {
    return Array.from(this.byOrganisationIndex.keys()).sort();
  }

  /**
   * Get all unique gender codes
   */
  getGenderCodes(): string[] {
    return Array.from(this.byGenderIndex.keys()).sort();
  }

  /**
   * Get statistics about the participants
   */
  getStatistics(): {
    total: number;
    organisations: { [key: string]: number };
    genders: { [key: string]: number };
    functions: { [key: string]: number };
  } {
    const organisations: { [key: string]: number } = {};
    const genders: { [key: string]: number } = {};
    const functions: { [key: string]: number } = {};

    this.participants.forEach(participant => {
      // Count organisations
      const org = participant.organisation.code;
      organisations[org] = (organisations[org] || 0) + 1;

      // Count genders
      const gender = participant.gender.code;
      genders[gender] = (genders[gender] || 0) + 1;

      // Count functions
      const func = participant.function;
      functions[func] = (functions[func] || 0) + 1;
    });

    return {
      total: this.participants.length,
      organisations,
      genders,
      functions
    };
  }
}
