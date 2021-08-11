const
    {describe, test} = require('mocha'),
    expect           = require('expect'),
    DataModel        = require('../module.persistence.data-model.js'),
    FactoryModel     = require('../module.persistence.factory-model.js'),
    StoreModel       = require('../module.persistence.store-model.js');

describe('StoreModel', function () {

    test('DeepObjectIndex', function () {

        const quadIndex = new StoreModel.DeepObjectIndex(4);

        quadIndex.add(0, 0, 0, 0, 'Hello World!');
        expect(quadIndex.get(0, 0, 0, 0)).toBe('Hello World!');

    });

    test('BidirectionalObjectIndex', function () {

        const termIndex = new StoreModel.BidirectionalObjectIndex();

        termIndex.addEntry(0, 'Hello World!');
        termIndex.addEntry(1, 'Lorem Ipsum');
        expect(termIndex.getValue(0)).toBe('Hello World!');

    });

    test('Dataset', function () {

        const
            factory = new FactoryModel.TermFactory({
                'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
            }),
            dataset = new StoreModel.Dataset(null, factory);

        expect(dataset.factory).toBe(factory);
        expect(dataset.context()).toEqual({});

    });

});
