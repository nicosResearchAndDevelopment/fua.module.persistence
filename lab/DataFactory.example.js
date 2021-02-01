const {
    namedNode, blankNode, literal, variable, defaultGraph, quad,
    fromTerm, fromQuad
} = require('../src/module.persistence.js');

const tmp = quad(namedNode('ex:test'), namedNode('rdfs:label'), literal('Hello World!', 'en'));

console.log('' + tmp);
console.log(JSON.stringify(tmp));

debugger;