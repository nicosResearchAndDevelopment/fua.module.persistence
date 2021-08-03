const
    {describe, test} = require('mocha'),
    expect           = require('expect'),
    DataModel        = require('../module.persistence.data-model.js'),
    FactoryModel     = require('../module.persistence.factory-model.js'),
    StoreModel     = require('../module.persistence.store-model.js');

describe('StoreModel', function () {

    test('DeepObjectIndex', function() {

        const quadIndex = new StoreModel.DeepObjectIndex(4);

        quadIndex.add(0, 0, 0, 0, 'Hello World!');
        expect(quadIndex.get(0, 0, 0, 0)).toBe('Hello World!');

    });

    test('Dataset', function() {

    });

});
