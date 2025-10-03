# Participant Lookup System

This document describes the comprehensive participant lookup system that makes it easy to search and find participants in the fencing project.

## Overview

The participant lookup system provides multiple ways to search through the participants array with efficient indexing and caching. It includes:

- **ParticipantService**: Core service with indexed lookups
- **ParticipantLookupUtil**: Advanced utility with pattern matching and bulk operations
- **FencingToParticipantMapper**: Integration with fencing data
- **ParticipantController**: REST API endpoints
- **Comprehensive examples**: Usage examples for all functionality

## Quick Start

### Basic Lookups

```typescript
// Get participant by ID
const participant = participantService.getById('23667a1f-8793-4c21-8351-d74d2c39f1e6');

// Get participant by code
const participant = participantService.getByCode('10003631');

// Get participants by name
const participants = participantService.getByName('RAMAN');

// Get participants by full name
const participants = participantService.getByFullName('RAMAN', 'HRUSHAVETS');
```

### Quick Lookup Utility

```typescript
// Try any identifier (ID, code, or name)
const participant = participantLookupUtil.quickLookup('10003631');
const participant = participantLookupUtil.quickLookup('RAMAN');
const participant = participantLookupUtil.quickLookup('23667a1f-8793-4c21-8351-d74d2c39f1e6');
```

## API Endpoints

### Basic Lookups

- `GET /participants` - Get all participants
- `GET /participants/id/:id` - Get participant by ID
- `GET /participants/code/:code` - Get participant by code
- `GET /participants/name/:name` - Get participants by name
- `GET /participants/surname/:surname` - Get participants by surname
- `GET /participants/fullname/:name/:surname` - Get participants by full name

### Organization & Gender

- `GET /participants/organisation/:organisation` - Get participants by organization
- `GET /participants/organisation/:organisation/stats` - Get participants with statistics
- `GET /participants/gender/:gender` - Get participants by gender

### Search & Statistics

- `GET /participants/search?name=John&organisation=USA` - Advanced search with filters
- `GET /participants/organisations` - Get all organization codes
- `GET /participants/genders` - Get all gender codes
- `GET /participants/statistics` - Get overall statistics

## Advanced Features

### Pattern Matching

```typescript
// Find participants by name pattern (supports wildcards)
const participants = participantLookupUtil.getByNamePattern('Ivan*');
const participants = participantLookupUtil.getByNamePattern('*Smith');
```

### Partial Name Search

```typescript
// Find participants with partial name match
const participants = participantLookupUtil.findByPartialName('Ivan');
```

### Bulk Operations

```typescript
// Get multiple participants by codes
const participants = participantLookupUtil.getByCodes(['10003631', '10003540', '10003538']);

// Get multiple participants by IDs
const participants = participantLookupUtil.getByIds(['id1', 'id2', 'id3']);
```

### Advanced Search

```typescript
// Search with multiple criteria
const participants = participantLookupUtil.advancedSearch({
  organisation: 'RUS',
  gender: 'M',
  partialName: 'Ivan'
});
```

### Grouping and Statistics

```typescript
// Get participants grouped by organization
const grouped = participantLookupUtil.getGroupedByOrganisation();

// Get participants grouped by gender
const grouped = participantLookupUtil.getGroupedByGender();

// Get overall statistics
const stats = participantService.getStatistics();
```

## Integration with Fencing Data

### Mapping Tireurs to Participants

```typescript
const tireur = {
  ID: '23667a1f-8793-4c21-8351-d74d2c39f1e6',
  Nom: 'RAMAN',
  Prenom: 'HRUSHAVETS',
  Code: '10003631'
};

// Map tireur to participant
const participant = fencingToParticipantMapper.mapToParticipant(tireur);

// Map multiple tireurs
const participants = fencingToParticipantMapper.mapToParticipants([tireur1, tireur2]);
```

## Performance Features

### Indexing

The system automatically builds indexes for fast lookups:
- **ID Index**: O(1) lookup by participant ID
- **Code Index**: O(1) lookup by participant code
- **Name Index**: O(1) lookup by name (multiple entries supported)
- **Surname Index**: O(1) lookup by surname (multiple entries supported)
- **Organization Index**: O(1) lookup by organization code
- **Gender Index**: O(1) lookup by gender code

### Caching

All indexes are built once at startup and cached in memory for maximum performance.

## Data Structure

Each participant has the following structure:

```typescript
interface Participant {
  idParticipant: string;    // Unique identifier
  name: string;            // First name
  surname: string;         // Last name
  gender: {
    code: string;          // M or W
  };
  code: string;            // Participant code
  organisation: {
    code: string;         // Organization code (e.g., 'USA', 'RUS')
  };
  function: string;        // Role (e.g., 'ATHLE')
}
```

## Error Handling

All lookup methods return consistent results:

```typescript
// Single participant lookup
interface ParticipantLookupResult {
  participant: Participant | null;
  index: number;  // -1 if not found
}

// Search results
interface ParticipantSearchResult {
  participants: Participant[];
  total: number;
  filters: ParticipantSearchFilters;
}
```

## Usage Examples

See `src/fencing/application/examples/participant-lookup-examples.ts` for comprehensive usage examples covering all functionality.

## Performance Notes

- **Index Building**: O(n) time complexity, done once at startup
- **ID/Code Lookup**: O(1) time complexity
- **Name/Surname Lookup**: O(1) time complexity for exact matches
- **Partial Search**: O(n) time complexity for pattern matching
- **Memory Usage**: Minimal overhead with efficient indexing

## Best Practices

1. **Use exact lookups when possible**: ID and code lookups are fastest
2. **Use indexes for organization/gender filtering**: Much faster than full array search
3. **Combine filters for complex searches**: Use the search method with multiple filters
4. **Use bulk operations for multiple lookups**: More efficient than individual calls
5. **Cache results when appropriate**: The service handles internal caching automatically

## Troubleshooting

### Common Issues

1. **Case Sensitivity**: Name searches are case-insensitive
2. **Multiple Matches**: Some methods return arrays when multiple participants match
3. **Missing Data**: Use `getIncompleteParticipants()` to find participants with missing fields
4. **Performance**: For large datasets, use indexed lookups instead of pattern matching

### Debugging

Enable logging to see lookup performance:

```typescript
// The service automatically logs lookup operations
// Check console output for performance metrics
```
