import { Injectable } from '@nestjs/common';
import { FencingToParticipantMapper } from '../mapper/fencing-to-participant.mapper';
import { Tireur } from '../mapper/fencing-to-participant.mapper';
import { TireurInMatch } from 'src/fencing/domain/interfaces/fencing.interfaces';

/**
 * Examples of how to create CreateStartListDto objects
 */
@Injectable()
export class CreateStartListExamples {
  constructor(private readonly fencingToParticipantMapper: FencingToParticipantMapper) {}

  /**
   * Example 1: Create basic start list with default values
   */
  createBasicStartList() {
    const tireurs: TireurInMatch[] = [
      { REF: '1', Cote: 'D' },
      { REF: '2', Cote: 'G' },
    ];

    const metadata = {
      discipline: 'FEN',
      gender: 'M',
      sportEvent: 'SABRE',
      category: 'GENERAL',
      phase: 'GP01',
      unit: '0001',
      subUnit: '----',
      phaseCode: 'FENMSABRE-------------GP01--------',
      unitCode: 'FENMSABRE-------------GP010001----'
    };

    const startListDto = this.fencingToParticipantMapper.createStartListDto(tireurs as TireurInMatch[], metadata);
    
    console.log('Basic Start List:', startListDto);
    return startListDto;
  }

  /**
   * Example 2: Create start list with custom competitor type
   */
  createCustomStartList() {
    const tireurs: TireurInMatch[] = [
      { REF: '4', Cote: 'D' },
      { REF: '5', Cote: 'G' }
    ];

    const metadata = {
      discipline: 'Fencing',
      gender: 'F',
      sportEvent: 'Individual Epee',
      category: 'Junior',
      phase: 'Final',
      unit: 'Direct Elimination',
      subUnit: 'Round of 16',
      phaseCode: 'FINAL',
      unitCode: 'DE_R16'
    };

    const startListDto = this.fencingToParticipantMapper.createStartListDtoWithCustomType(
      tireurs as TireurInMatch[],
      'Team', // Custom competitor type
      metadata,
      true // hasBye = true
    );
    
    console.log('Custom Start List:', startListDto);
    return startListDto;
  }

  /**
   * Example 3: Create start list for different phases
   */
  createPhaseStartList(phase: string, unit: string) {
    const tireurs: TireurInMatch[] = [
      { REF: '6', Cote: 'D' },
      { REF: '7', Cote: 'G' },
      { REF: '8', Cote: 'D' }
    ];

    const metadata = {
      discipline: 'FEN',
      gender: 'M',
      sportEvent: 'SABRE',
      category: 'GENERAL',
      phase: phase,
      unit: unit,
      subUnit: '----',
      phaseCode: `FENMSABRE-------------${phase.toUpperCase()}--------`,
      unitCode: `FENMSABRE-------------${phase.toUpperCase()}${unit.toUpperCase().padEnd(4, '0')}`
    };

    const startListDto = this.fencingToParticipantMapper.createStartListDto(tireurs, metadata);
    
    console.log(`${phase} Start List:`, startListDto);
    return startListDto;
  }

  /**
   * Example 4: Create start list with all available tireurs from dictionary
   */
  createFullStartList() {
    // Get all available tireur IDs from the dictionary
    const availableIds = this.fencingToParticipantMapper.getAvailableTireurIds();
    
    // Create tireurs using all available IDs
    const tireurs: TireurInMatch[] = availableIds.map(id => ({
      REF: id,
      Cote: id.charAt(0) === '1' ? 'D' : 'G'
    }));

    const metadata = {
      discipline: 'Fencing',
      gender: 'M',
      sportEvent: 'Individual Foil',
      category: 'Senior',
      phase: 'Preliminary',
      unit: 'All Pools',
      subUnit: undefined,
      phaseCode: 'PRELIM',
      unitCode: 'ALL_POOLS'
    };

    const startListDto = this.fencingToParticipantMapper.createStartListDto(tireurs, metadata);
    
    console.log('Full Start List with all participants:', startListDto);
    return startListDto;
  }

  /**
   * Example 5: Create start list with specific gender and category
   */
  createGenderCategoryStartList(gender: string, category: string) {
    const tireurs: TireurInMatch[] = [
      { REF: '1', Cote: 'D' },
      { REF: '2', Cote: 'G' },
      { REF: '3', Cote: 'D' }
    ];

    const metadata = {
      discipline: 'Fencing',
      gender: gender,
      sportEvent: `Individual Foil - ${category}`,
      category: category,
      phase: 'Preliminary',
      unit: `Pool ${gender === 'M' ? 'A' : 'B'}`,
      subUnit: undefined,
      phaseCode: 'PRELIM',
      unitCode: `POOL_${gender === 'M' ? 'A' : 'B'}`
    };

    const startListDto = this.fencingToParticipantMapper.createStartListDto(tireurs, metadata);
    
    console.log(`${gender} ${category} Start List:`, startListDto);
    return startListDto;
  }

  /**
   * Run all examples
   */
  runAllExamples() {
    console.log('=== Create Start List Examples ===');
    
    this.createBasicStartList();
    this.createCustomStartList();
    this.createPhaseStartList('Preliminary', 'Pool A');
    this.createPhaseStartList('Final', 'Direct Elimination');
    this.createFullStartList();
    this.createGenderCategoryStartList('M', 'Senior');
    this.createGenderCategoryStartList('F', 'Junior');
  }
}
