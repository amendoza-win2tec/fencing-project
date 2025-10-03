"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ParticipantService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantService = void 0;
const common_1 = require("@nestjs/common");
const path = require("path");
const fs = require("fs");
let ParticipantService = ParticipantService_1 = class ParticipantService {
    constructor() {
        this.logger = new common_1.Logger(ParticipantService_1.name);
        this.participants = this.loadParticipants();
        this.byIdIndex = new Map();
        this.byCodeIndex = new Map();
        this.byNameIndex = new Map();
        this.bySurnameIndex = new Map();
        this.byOrganisationIndex = new Map();
        this.byGenderIndex = new Map();
        if (!this.participants || this.participants.length === 0) {
            this.logger.error('No participants data loaded');
            throw new Error('Failed to load participants data');
        }
        this.buildIndexes();
    }
    loadParticipants() {
        try {
            const sourcePath = path.join(__dirname, 'participants.json');
            if (fs.existsSync(sourcePath)) {
                const data = fs.readFileSync(sourcePath, 'utf8');
                return JSON.parse(data);
            }
            const rootPath = path.join(process.cwd(), 'src', 'fencing', 'infraestructure', 'shared', 'participants.json');
            if (fs.existsSync(rootPath)) {
                const data = fs.readFileSync(rootPath, 'utf8');
                return JSON.parse(data);
            }
            const distPath = path.join(__dirname, '..', '..', '..', '..', 'src', 'fencing', 'infraestructure', 'shared', 'participants.json');
            if (fs.existsSync(distPath)) {
                const data = fs.readFileSync(distPath, 'utf8');
                return JSON.parse(data);
            }
            this.logger.error('Participants JSON file not found in any expected location');
            throw new Error('Participants JSON file not found');
        }
        catch (error) {
            this.logger.error(`Error loading participants data: ${error.message}`);
            throw new Error(`Failed to load participants data: ${error.message}`);
        }
    }
    buildIndexes() {
        this.logger.log(`Building indexes for ${this.participants.length} participants`);
        this.participants.forEach((participant, index) => {
            this.byIdIndex.set(participant.idParticipant, index);
            this.byCodeIndex.set(participant.code, index);
            const nameKey = participant.name.toLowerCase();
            if (!this.byNameIndex.has(nameKey)) {
                this.byNameIndex.set(nameKey, []);
            }
            this.byNameIndex.get(nameKey).push(index);
            const surnameKey = participant.surname.toLowerCase();
            if (!this.bySurnameIndex.has(surnameKey)) {
                this.bySurnameIndex.set(surnameKey, []);
            }
            this.bySurnameIndex.get(surnameKey).push(index);
            const orgKey = participant.organisation.code;
            if (!this.byOrganisationIndex.has(orgKey)) {
                this.byOrganisationIndex.set(orgKey, []);
            }
            this.byOrganisationIndex.get(orgKey).push(index);
            const genderKey = participant.gender.code;
            if (!this.byGenderIndex.has(genderKey)) {
                this.byGenderIndex.set(genderKey, []);
            }
            this.byGenderIndex.get(genderKey).push(index);
        });
        this.logger.log('Indexes built successfully');
    }
    getById(id) {
        const index = this.byIdIndex.get(id);
        if (index !== undefined) {
            return {
                participant: this.participants[index],
                index
            };
        }
        return { participant: null, index: -1 };
    }
    getByCode(code) {
        const index = this.byCodeIndex.get(code);
        if (index !== undefined) {
            return {
                participant: this.participants[index],
                index
            };
        }
        return { participant: null, index: -1 };
    }
    getByName(name) {
        const nameKey = name.toLowerCase();
        const indices = this.byNameIndex.get(nameKey) || [];
        return indices.map(index => this.participants[index]);
    }
    getBySurname(surname) {
        const surnameKey = surname.toLowerCase();
        const indices = this.bySurnameIndex.get(surnameKey) || [];
        return indices.map(index => this.participants[index]);
    }
    getByFullName(name, surname) {
        const nameKey = name.toLowerCase();
        const surnameKey = surname.toLowerCase();
        const nameIndices = this.byNameIndex.get(nameKey) || [];
        const surnameIndices = this.bySurnameIndex.get(surnameKey) || [];
        const commonIndices = nameIndices.filter(index => surnameIndices.includes(index));
        return commonIndices.map(index => this.participants[index]);
    }
    getByOrganisation(organisationCode) {
        const indices = this.byOrganisationIndex.get(organisationCode) || [];
        return indices.map(index => this.participants[index]);
    }
    getByGender(genderCode) {
        const indices = this.byGenderIndex.get(genderCode) || [];
        return indices.map(index => this.participants[index]);
    }
    search(filters) {
        let indices = [];
        let isFirstFilter = true;
        if (filters.name) {
            const nameKey = filters.name.toLowerCase();
            const nameIndices = this.byNameIndex.get(nameKey) || [];
            indices = isFirstFilter ? nameIndices : indices.filter(index => nameIndices.includes(index));
            isFirstFilter = false;
        }
        if (filters.surname) {
            const surnameKey = filters.surname.toLowerCase();
            const surnameIndices = this.bySurnameIndex.get(surnameKey) || [];
            indices = isFirstFilter ? surnameIndices : indices.filter(index => surnameIndices.includes(index));
            isFirstFilter = false;
        }
        if (filters.code) {
            const codeIndex = this.byCodeIndex.get(filters.code);
            if (codeIndex !== undefined) {
                indices = isFirstFilter ? [codeIndex] : indices.filter(index => index === codeIndex);
            }
            else {
                indices = [];
            }
            isFirstFilter = false;
        }
        if (filters.organisation) {
            const orgIndices = this.byOrganisationIndex.get(filters.organisation) || [];
            indices = isFirstFilter ? orgIndices : indices.filter(index => orgIndices.includes(index));
            isFirstFilter = false;
        }
        if (filters.gender) {
            const genderIndices = this.byGenderIndex.get(filters.gender) || [];
            indices = isFirstFilter ? genderIndices : indices.filter(index => genderIndices.includes(index));
            isFirstFilter = false;
        }
        if (filters.function) {
            indices = indices.filter(index => this.participants[index].function.toLowerCase() === filters.function.toLowerCase());
        }
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
    getAll() {
        return [...this.participants];
    }
    getTotalCount() {
        return this.participants.length;
    }
    getByOrganisationWithStats(organisationCode) {
        const participants = this.getByOrganisation(organisationCode);
        const genderBreakdown = participants.reduce((acc, participant) => {
            const gender = participant.gender.code;
            acc[gender] = (acc[gender] || 0) + 1;
            return acc;
        }, {});
        return {
            participants,
            total: participants.length,
            genderBreakdown
        };
    }
    getOrganisationCodes() {
        return Array.from(this.byOrganisationIndex.keys()).sort();
    }
    getGenderCodes() {
        return Array.from(this.byGenderIndex.keys()).sort();
    }
    getStatistics() {
        const organisations = {};
        const genders = {};
        const functions = {};
        this.participants.forEach(participant => {
            const org = participant.organisation.code;
            organisations[org] = (organisations[org] || 0) + 1;
            const gender = participant.gender.code;
            genders[gender] = (genders[gender] || 0) + 1;
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
};
exports.ParticipantService = ParticipantService;
exports.ParticipantService = ParticipantService = ParticipantService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ParticipantService);
//# sourceMappingURL=participant.service.js.map