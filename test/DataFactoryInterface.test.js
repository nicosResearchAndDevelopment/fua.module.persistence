const
	{ describe, it } = require('mocha'),
	expect = require('expect'),
	dataFactory = require('../src/module.persistence.js');

describe('module.persistence : DataFactoryInterface', function() {

	it('should have a function "namedNode" returning a NamedNode', function() {
		expect(typeof dataFactory.namedNode).toBe('function');
		expect(dataFactory.namedNode('http://example.org/test')).toMatchObject({
			termType: 'NamedNode',
			value: 'http://example.org/test'
		});
	});

	it('should have a function "blankNode" returning a BlankNode', function() {
		expect(typeof dataFactory.blankNode).toBe('function');
		expect(dataFactory.blankNode('1')).toMatchObject({
			termType: 'BlankNode',
			value: '1'
		});
	});

	it('should have a function "literal" returning a Literal', function() {
		expect(typeof dataFactory.literal).toBe('function');
		expect(dataFactory.literal('hello world')).toMatchObject({
			termType: 'Literal',
			value: 'hello world'
		});
	});

	it('should have a function "variable" returning a Variable', function() {
		expect(typeof dataFactory.variable).toBe('function');
		expect(dataFactory.variable('test')).toMatchObject({
			termType: 'Variable',
			value: 'test'
		});
	});

	it('should have a function "defaultGraph" returning a DefaultGraph', function() {
		expect(typeof dataFactory.defaultGraph).toBe('function');
		expect(dataFactory.defaultGraph()).toMatchObject({
			termType: 'DefaultGraph'
		});
	});

	it('should have a function "quad" returning a Quad', function() {
		expect(typeof dataFactory.quad).toBe('function');
		expect(dataFactory.quad(
			dataFactory.blankNode('1'),
			dataFactory.namedNode('http://example.org/test'),
			dataFactory.literal('hello world'),
			dataFactory.defaultGraph()
		)).toMatchObject({
			termType: 'Quad',
			subject: {
				termType: 'BlankNode',
				value: '1'
			},
			predicate: {
				termType: 'NamedNode',
				value: 'http://example.org/test'
			},
			object: {
				termType: 'Literal',
				value: 'hello world'
			},
			graph: {
				termType: 'DefaultGraph'
			}
		});
	});

	// TODO more tests

});