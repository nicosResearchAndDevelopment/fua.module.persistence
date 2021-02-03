const {
        fromQuad, dataset, generateGraph
    } = require('../src/module.persistence.js'),
    myData = dataset();

myData.add(fromQuad({
    subject: {
        termType: 'NamedNode',
        value: 'ex:test'
    },
    predicate: {
        termType: 'NamedNode',
        value: 'rdfs:comment'
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

console.log(generateGraph(myData));
debugger;