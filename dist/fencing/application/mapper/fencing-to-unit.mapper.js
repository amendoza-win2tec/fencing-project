"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapToW2tecPhases = exports.convertEliminationToMatch = exports.convertPouleToMatch = void 0;
const phaseDictionary = {
    'POULE1': 'GP01',
    'POULE2': 'GP02',
    'POULE3': 'GP03',
    'POULE4': 'GP04',
    'POULE5': 'GP05',
    'POULE6': 'GP06',
    'A32': 'R32',
    'A16': 'R16',
    'A8': '8FNL',
    'A4': 'SFNL',
    'A2': 'FNL',
    'B2': 'REPF',
};
const genderDictionary = {
    F: 'W',
    M: 'M',
};
const sportEventDictionary = {
    S: 'SABRE',
    E: 'EPEE',
    F: 'FOIL',
};
const generateDescription = (name, shortName) => {
    const description = {
        eng: {
            lang: 'eng',
            long: name,
            short: shortName,
        },
    };
    return description;
};
const getMedalsInfo = (metadata) => {
    if (metadata.phase === 'FNL') {
        return {
            hasMedals: true,
            medalCodes: ['GOLD', 'SILVER'],
            medalQuantities: [{
                    code: 'GOLD',
                    quantity: 1
                }, {
                    code: 'SILVER',
                    quantity: 1
                }],
        };
    }
    if (metadata.phase === 'SFNL') {
        return {
            hasMedals: true,
            medalCodes: ['BRONZE'],
            medalQuantities: [{
                    code: 'BRONZE',
                    quantity: 1
                }],
        };
    }
    return {
        hasMedals: false,
        medalCodes: [],
    };
};
const locationDictionary = {
    'GREEN': '6cd841a7-53fe-40e6-9fb3-88a5c7bb5ca9',
    'RED': '87cfd7c7-9ea7-40f1-86d8-c87e0b07e0d2',
    'BLUE': '186fb422-8cd0-402c-b6ea-3d9caae13526',
    'YELLOW': '48ddff12-af02-449e-9f17-1ffd6bcaad1c',
    'FINAL': '3c5bddd0-990a-498c-8fd7-3c16becd9363'
};
const rscCodeConverter = (gender, phase, sportEvent, combatNumber) => {
    const disciplineCode = 'FEN';
    const genderCode = genderDictionary[gender];
    const phaseCode = phaseDictionary[phase];
    const sportEventCode = sportEventDictionary[sportEvent];
    const unitCode = combatNumber.padStart(4, '0');
    const rscCode = `${disciplineCode}${genderCode}${sportEventCode.padEnd(18, '-')}${phaseCode.padEnd(4, '-')}--------`;
    return {
        discipline: disciplineCode,
        gender: genderCode,
        sportEvent: sportEventCode,
        phase: phaseCode,
        phaseCode: rscCode,
        unit: unitCode,
        rscCode,
    };
};
const generateDateInfo = (startDate, startTime) => {
    const date = `${startDate}T${startTime}`;
    return {
        startDate: date,
        endDate: date,
    };
};
const determineUnitStatus = (tireurStatus) => {
    const justScheduled = tireurStatus.length === 0;
    if (justScheduled) {
        return 'SCHEDULED';
    }
    return tireurStatus.find((tireur) => tireur.status)
        ? 'OFFICIAL'
        : 'START_LIST';
};
const convertPouleToMatch = (poule, _sportEvent) => {
    const matches = poule.Match;
    const gender = 'M';
    const convertedMatches = matches.map(m => {
        const sportEvent = _sportEvent;
        const phase = `POULE${poule.ID}`;
        const combatNumber = m.ID;
        const startDate = poule.Date;
        const startTime = poule.Heure;
        const location = poule.Piste;
        return {
            ID: m.ID,
            Tireur: m.Tireur,
            sportEvent,
            combatNumber,
            startDate,
            startTime,
            location,
            gender,
            phase
        };
    });
    return convertedMatches;
};
exports.convertPouleToMatch = convertPouleToMatch;
const convertEliminationToMatch = (elimination, _sportEvent, _gender) => {
    const tableaux = Array.isArray(elimination.Tableau) ? elimination.Tableau : [elimination.Tableau];
    const gender = genderDictionary[_gender];
    const convertedMatches = tableaux.flatMap(m => {
        const sportEvent = _sportEvent;
        const phase = m.ID;
        const matchArray = Array.isArray(m.Match) ? m.Match : [m.Match];
        const phaseMatches = matchArray.map(match => ({
            ID: match.ID,
            Tireur: match.Tireur,
            sportEvent,
            combatNumber: match.ID,
            startDate: match.Date,
            startTime: match.Heure,
            location: match.Piste,
            gender,
            phase
        }));
        return phaseMatches;
    });
    return convertedMatches;
};
exports.convertEliminationToMatch = convertEliminationToMatch;
const mapToW2tecPhases = (match, name, progressionId, tireurStatus, shortName, gender) => {
    const rscVO = rscCodeConverter(match.gender, match.phase, match.sportEvent, match.combatNumber);
    const splittedStartDate = match.startDate.split('.');
    const parsedDate = `${splittedStartDate[2]}-${splittedStartDate[1]}-${splittedStartDate[0]}`;
    const parsedTime = `${match.startTime}:00`;
    const _gender = genderDictionary[gender];
    return {
        unitsNumber: 1,
        code: rscVO.rscCode.slice(0, -8).concat(rscVO.unit.padEnd(8, '-')),
        name: name,
        description: generateDescription(name, shortName),
        order: parseInt(progressionId) || 0,
        unitTypeCode: 'HATH',
        metadata: {
            discipline: rscVO.discipline,
            gender: rscVO.gender,
            sportEvent: rscVO.sportEvent,
            category: 'GENERAL',
            phase: rscVO.phase,
            unit: rscVO.unit,
            phaseCode: rscVO.rscCode,
        },
        dateInfo: generateDateInfo(parsedDate, parsedTime),
        location: locationDictionary[match.location],
        hasMedals: getMedalsInfo(rscVO).hasMedals,
        medalCodes: getMedalsInfo(rscVO).medalCodes,
        medalQuantities: getMedalsInfo(rscVO).medalQuantities,
        venue: 'GSP',
        status: determineUnitStatus(tireurStatus),
    };
};
exports.mapToW2tecPhases = mapToW2tecPhases;
//# sourceMappingURL=fencing-to-unit.mapper.js.map