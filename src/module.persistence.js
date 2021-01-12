exports.DataFactoryInterface = require('./DataFactoryInterface.js');
exports.DatasetCoreInterface = require('./DatasetCoreInterface.js');
exports.DatasetCoreFactoryInterface = require('./DatasetCoreFactoryInterface.js');

exports.util = require('util');
exports.url = require('url');
exports.path = require('path');
exports.fs = require('fs');
exports.events = require('events');
exports.stream = require('stream');

exports.promisify = exports.util.promisify;
exports.joinPath = exports.path.join;
exports.readFile = exports.promisify(exports.fs.readFile);
exports.writeFile = exports.promisify(exports.fs.writeFile);

exports.n3 = require('n3');
exports.rdflib = require('rdflib');
exports.jsonld = require('jsonld');
exports.rdf_validate_shacl = require('rdf-validate-shacl');
exports.fetch = require('node-fetch');

exports.NamedNode = exports.rdflib.NamedNode;
exports.Blankode = exports.rdflib.Blankode;
exports.Literal = exports.rdflib.Literal;
exports.Variable = exports.rdflib.Variable;
exports.defaultGraph = exports.rdflib.defaultGraph;
exports.Quad = exports.rdflib.Statement;
exports.Dataset = exports.n3.Store;
