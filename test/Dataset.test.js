const
    {describe, test, before} = require('mocha'),
    expect                   = require('expect'),
    {Dataset, TermFactory}   = require('../next/module.persistence.js');

describe('module.persistence : Dataset', function () {

    let dataset;
    before('construct a Dataset', function () {
        dataset = new Dataset();
    });

    test('should have a TermFactory attribute', async function () {

    });

    test('should add a NamedNode', async function () {
        dataset.add(dataset.factory.namedNode('ex:test'));
        expect(dataset.has(factory.namedNode('ex:test'))).toBeTruthy();
    });

}); // describe