const
    {describe, test} = require('mocha'),
    expect           = require('expect'),
    DataModel        = require('../module.persistence.data-model.js');

describe('DataModel', function () {

    test('NamedNode', function () {

        const rdf_type = new DataModel.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
        expect(rdf_type).toMatchObject({
            termType: 'NamedNode',
            value:    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
        });
        expect(rdf_type.toString()).toBe('<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>');

        const ex_hello = new DataModel.NamedNode('ex:hello');
        expect(ex_hello).toMatchObject({
            termType: 'NamedNode',
            value:    'ex:hello'
        });
        expect(ex_hello.toString()).toBe('ex:hello');

    });

});
