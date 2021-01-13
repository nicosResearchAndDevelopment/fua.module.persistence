const
	{ describe, it } = require('mocha'),
	expect = require('expect'),
	DataFactory = require('../src/module.persistence.js');

describe('module.persistence : DataFactoryInterface', function() {

	it('should have a function "namedNode" returning a NamedNode', function() {
		expect(typeof DataFactory.namedNode).toBe('function');
		expect(DataFactory.namedNode('http://example.org/test')).toMatchObject({
			termType: 'NamedNode',
			value: 'http://example.org/test'
		});
	});

	it('should have a function "blankNode" returning a BlankNode', function() {
		expect(typeof DataFactory.blankNode).toBe('function');
		expect(DataFactory.blankNode('1')).toMatchObject({
			termType: 'BlankNode',
			value: '1'
		});
	});

	it('should have a function "literal" returning a Literal', function() {
		expect(typeof DataFactory.literal).toBe('function');
		expect(DataFactory.literal('hello world')).toMatchObject({
			termType: 'Literal',
			value: 'hello world'
		});
	});

	it('should have a function "variable" returning a Variable', function() {
		expect(typeof DataFactory.variable).toBe('function');
		expect(DataFactory.variable('test')).toMatchObject({
			termType: 'Variable',
			value: 'test'
		});
	});

	it('should have a function "defaultGraph" returning a DefaultGraph', function() {
		expect(typeof DataFactory.defaultGraph).toBe('function');
		expect(DataFactory.defaultGraph()).toMatchObject({
			termType: 'DefaultGraph'
		});
	});

	it('should have a function "quad" returning a Quad', function() {
		expect(typeof DataFactory.quad).toBe('function');
		expect(DataFactory.quad(
			DataFactory.blankNode('1'),
			DataFactory.namedNode('http://example.org/test'),
			DataFactory.literal('hello world'),
			DataFactory.defaultGraph()
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