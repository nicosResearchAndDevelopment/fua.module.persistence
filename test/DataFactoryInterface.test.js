const
	{ describe, it } = require('mocha'),
	expect = require('expect'),
	dataFactory = require('../src/module.persistence.js');

describe('module.persistence : DataFactoryInterface', function() {

	it('should have a function "isNamedNode" returning if argument is a NamedNode', function() {
		expect(typeof dataFactory.isNamedNode).toBe('function');
		expect(dataFactory.isNamedNode(dataFactory.namedNode('http://example.org/test'))).toBeTruthy();
		expect(dataFactory.isNamedNode(dataFactory.blankNode('1'))).toBeFalsy();
	});

	// TODO more tests

});