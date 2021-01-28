const
    { fromQuad } = require('../src/DataFactory.js'),
    Dataset = require('../src/Dataset.js'),
    myData = new Dataset();

myData.add(fromQuad({
    subject: {
        termType: 'NamedNode',
        value: 'ex:test'
    },
    predicate: {
        termType: 'Variable',
        value: 'test'
    },
    object: {
        termType: 'Literal',
        value: 'Hello World!',
        language: 'en'
    }
}));

myData.add(fromQuad({
    subject: {
        termType: 'NamedNode',
        value: 'ex:test'
    },
    predicate: {
        termType: 'NamedNode',
        value: 'ex:name'
    },
    object: {
        termType: 'Literal',
        value: 'Lorem Ipsum'
    }
}));

console.log(Array.from(myData));
debugger;