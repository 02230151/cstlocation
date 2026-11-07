import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getBuildingDetails } from './buildingDetails.js';

describe('building details', () => {
  it('returns supplied classroom floor and room information', () => {
    const details = getBuildingDetails('Classroom', 'Classroom');
    assert.match(details.description, /teaching rooms/i);
    assert.equal(details.floors[0].name, 'Ground floor');
    assert.deepEqual(details.floors[0].zones[0].rooms.slice(0, 2), ['CR01', 'CR02']);
  });

  it('returns a useful floor-plan placeholder for buildings without floor data', () => {
    const details = getBuildingDetails('Convention Hall', 'Convention Hall');
    assert.match(details.description, /Convention Hall/);
    assert.deepEqual(details.floors, []);
  });

  it('includes the football-ground facilities without inventing their floor assignment', () => {
    const details = getBuildingDetails('Lab', 'Lab');
    assert.ok(details.areaFacilities.includes('Structure Timber Testing'));
    assert.match(details.description, /do not identify their host building or floors/i);
  });
});
