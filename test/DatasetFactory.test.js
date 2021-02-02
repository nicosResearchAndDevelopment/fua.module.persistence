const
    { describe, test } = require('mocha'),
    expect = require('expect'),
    persistence = require('../src/module.persistence.js');

describe('DatasetFactory Interface', function() {

    describe('Dataset', function() {

        test('should have a "isDataset" and a "dataset" method', async function() {
            expect(typeof persistence.isDataset).toBe('function');
            expect(typeof persistence.dataset).toBe('function');
        });

        test('Dataset tests are missing');

    }); // describe: Dataset

}); // describe: DatasetFactory Interface