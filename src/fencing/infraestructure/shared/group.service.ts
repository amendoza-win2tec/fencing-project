import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import type { Participant } from 'src/fencing/domain/interfaces/participant.interfaces';

export interface GroupParticipant {
  participantId: string;
  name: string;
  surname: string;
  delegation: string;
}

export interface Group {
  _id: { $oid: string };
  groupId: number;
  code: string;
  name: string;
  delegation: string;
  participants: Participant[];
}

@Injectable()
export class GroupService {
  private groups: Group[] = [];
  private participants: Participant[] = [];
  private groupsLoaded = false;

  constructor() {
    this.loadGroups();
  }

  private loadGroups(): void {
    try {
      const groupsPath = path.join(__dirname, 'fen_teams_m_epee.json');
      const groupsData = fs.readFileSync(groupsPath, 'utf8');
      this.groups = JSON.parse(groupsData);
      this.groupsLoaded = true;
      const participantsPath = path.join(__dirname, 'grs_db.participants-FEN.json');
      const participantsData = fs.readFileSync(participantsPath, 'utf8');
      this.participants = JSON.parse(participantsData);
    } catch (error) {
      console.error('Error loading groups.json:', error);
      this.groups = [];
    }
  }

  /**
   * Get group by code
   */
  getGroupByCode(code: string): Group | null {
    if (!this.groupsLoaded) {
      this.loadGroups();
    }
    
    const group = this.groups.find(group => group.code === code) || null;
    if (group) {
      return {
        ...group,
        participants: (group.participants as unknown as string[]).map(participant => this.participants.find(p => p.idParticipant === participant))
      };
    }
    return null;
  }

  /**
   * Get group by groupId
   */
  getGroupById(groupId: number): Group | null {
    if (!this.groupsLoaded) {
      this.loadGroups();
    }
    
    return this.groups.find(group => group.groupId === groupId) || null;
  }

  /**
   * Get all groups
   */
  getAllGroups(): Group[] {
    if (!this.groupsLoaded) {
      this.loadGroups();
    }
    
    return this.groups;
  }

  /**
   * Get groups by delegation
   */
  getGroupsByDelegation(delegation: string): Group[] {
    if (!this.groupsLoaded) {
      this.loadGroups();
    }
    
    return this.groups.filter(group => group.delegation === delegation);
  }
}
