import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

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
  participants: GroupParticipant[];
}

@Injectable()
export class GroupService {
  private groups: Group[] = [];
  private groupsLoaded = false;

  constructor() {
    this.loadGroups();
  }

  private loadGroups(): void {
    try {
      const groupsPath = path.join(__dirname, 'groups.json');
      const groupsData = fs.readFileSync(groupsPath, 'utf8');
      this.groups = JSON.parse(groupsData);
      this.groupsLoaded = true;
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
    
    return this.groups.find(group => group.code === code) || null;
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
