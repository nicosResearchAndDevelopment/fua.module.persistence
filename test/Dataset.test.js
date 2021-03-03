const
    {describe, test, before} = require('mocha'),
    expect                   = require('expect'),
    {Dataset, TermFactory}   = require('../src/module.persistence.js');

describe('module.persistence : Dataset', function () {

    let dataset;
    before('construct a Dataset', function () {
        dataset = new Dataset();
    });

    test('should have a TermFactory attribute', async function () {
        expect(dataset.factory).toBeInstanceOf(TermFactory);
    });

    test('should add a NamedNode', async function () {
        dataset.add(dataset.factory.namedNode('ex:test'));
        expect(dataset.has(dataset.factory.namedNode('ex:test'))).toBeTruthy();
    });

}); // describe