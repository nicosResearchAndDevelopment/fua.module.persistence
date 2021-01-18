const {
	namedNode, blankNode, literal, variable, defaultGraph, quad,
	fromTerm, fromQuad, fromString, termToString
} = require('../src/module.persistence.js');

console.log(termToString(fromString(`<http://example.org/>`)));
console.log(termToString(fromString(`<http://example.org/> rdfs:label "example"@en`)));
console.log(termToString(fromString(`   ?test   `)));
console.log(termToString(fromString(`_:11 http://example.org/ '''Lorem \n Ipsum'''^^ex:Test`)));
console.log(termToString(fromString(`<http://example.org/> http://example.org/ "asd" <http://example.org/> .`)));
debugger;