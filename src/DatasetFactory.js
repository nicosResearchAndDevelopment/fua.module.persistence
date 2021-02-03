const
    SHACLValidator = require('rdf-validate-shacl');
_ = require('./util.js'),
    dataFactory = require('./DataFactory.js'),
    model = require('./DatasetModel.js'),
    factory = exports;

/**
 * @function termToId
 * @param {Term|Literal|Quad} term
 * @returns {string}
 */
factory.termToId = function(term) {
    _.assert(dataFactory.isTerm(term), 'termToId : invalid term', TypeError);
    switch (term.termType) {
        case 'NamedNode':
            return term.value;
        case 'BlankNode':
            return '_:' + term.value;
        case 'Literal':
            return '"' + term.value + '"'
                + (term.language ? '@' + term.language : '^^' + term.datatype.value);
        case 'Variable':
            return '?' + term.value;
        case 'DefaultGraph':
            return '';
        case 'Quad':
            _.assert(false, 'termToId : Quads are not supported');
    }
}; // termToId

/**
 * @function termFromId
 * @param {string} termStr
 * @returns {Term}
 */
factory.termFromId = function(termStr) {
    _.assert(_.isString(termStr), 'termFromId : invalid termStr', TypeError);
    switch (termStr.charAt(0)) {
        case '':
            return dataFactory.defaultGraph();
        case '?':
            return dataFactory.variable(termStr.substr(1));
        case '_':
            return dataFactory.blankNode(termStr.substr(2));
        case '"':
            if (termStr.endsWith('"')) {
                return dataFactory.literal(
                    termStr.substr(1, termStr.length - 2)
                );
            } else {
                let langMatch = termStr.match(/"@(.*?)$/);
                if (langMatch) {
                    return dataFactory.literal(
                        termStr.substr(1, termStr.length - 1 - langMatch[0]),
                        langMatch[1]
                    );
                } else {
                    let dtMatch = termStr.match(/"\^\^(.*?)$/);
                    _.assert(dtMatch, 'termFromId : invalid literal');
                    return dataFactory.literal(
                        termStr.substr(1, termStr.length - 1 - dtMatch[0]),
                        dataFactory.namedNode(dtMatch[1])
                    );
                }
            }
        default:
            return dataFactory.namedNode(termStr);
    }
}; // termFromId

/**
 * @function isDataset
 * @param {Dataset} that
 * @returns {boolean}
 */
factory.isDataset = function(that) {
    return that instanceof model.Dataset;
}; // isDataset

/**
 * @function dataset
 * @param {Iterable<Quad>} quads
 * @returns {Dataset}
 */
factory.dataset = function(quads) {
    return new model.Dataset(quads);
}; // dataset

/**
 * @function termIndex
 * @returns {TermIndex}
 */
factory.termIndex = function() {
    return new model.TermIndex();
}; // termIndex

/**
 * @function quadIndex
 * @returns {QuadIndex}
 */
factory.quadIndex = function() {
    return new model.QuadIndex();
}; // quadIndex

/**
 * TODO: this is a legacy method and should be reworked
 * Can be used to generate a map with fully meshed nodes.
 * @typedef {string} Prefix
 * @typedef {string} URI
 * @param {Dataset} dataset
 * @param {Object<Prefix, URI>} [context={}]
 * @param {Object} [param0]
 * @param {Boolean} [param0.compact=true]
 * @param {Boolean} [param0.meshed=true]
 * @param {Boolean} [param0.blanks=false]
 * @returns {Map<URI, Object>}
 */
factory.generateGraph = function(dataset, context = {}, { compact = true, meshed = true, blanks = false } = {}) {
    const
        /** @type {Map<URI, Object>} */
        subjectMap = new Map(),
        /** @type {Map<URI, { "@id": String, [missingRef]: Array<[URI, URI]> }>} */
        missingMap = new Map(),
        /** @type {Map<URI, Object>} */
        blankMap = new Map(),
        /** @type {Map<URI, URI>} */
        idMap = new Map([
            ['http://www.w3.org/1999/02/22-rdf-syntax-ns#type', '@type']
        ]),
        /** @type {Map<Prefix, URI>} */
        prefixMap = new Map(Object.entries(context));

    /**
     * This function prefixes uris and caches them for this generation.
     * @param {URI} uri
     * @returns {URI}
     */
    function _prefixId(uri) {
        // return if already in idMap
        if (idMap.has(uri))
            return idMap.get(uri);

        // compact means, no prefixes gets registered
        if (!compact) return uri;

        // search all prefixes
        for (let [prefix, target] of prefixMap.entries()) {
            // if uri starts with a prefix, save entry in idMap and return
            if (uri.startsWith(target)) {
                let short = prefix + ':' + uri.substring(target.length);
                idMap.set(uri, short);
                return short;
            }
        }

        // if not returned already, there is no prefix for this uri
        idMap.set(uri, uri);
        return uri;
    } // _prefixId

    /**
     * This function takes a term, returns the corresponding value in jsonld and caches any nodes.
     * @param {Term} term
     * @returns {{"@id": String} | Object | String}
     */
    function _parseTerm(term) {
        let nodeId, node;
        switch (term.termType) {
            case 'NamedNode':
                nodeId = _prefixId(term.value);
                node = subjectMap.get(nodeId) || missingMap.get(nodeId);
                if (!node) {
                    node = { '@id': nodeId };
                    missingMap.set(nodeId, node);
                }
                break;

            case 'BlankNode':
                nodeId = term.value;
                node = blankMap.get(nodeId);
                if (!node) {
                    node = blanks ? { '@id': nodeId } : {};
                    blankMap.set(nodeId, node);
                }
                break;

            case 'Literal':
                if (term.lang) {
                    node = {
                        '@value': term.value,
                        '@language': term.lang
                    };
                } else if (term.datatype.value !== 'http://www.w3.org/2001/XMLSchema#string') {
                    node = {
                        '@value': term.value,
                        '@type': _prefixId(term.datatype.value)
                    };
                } else {
                    node = term.value;
                }
                break;

            default:
                node = null;
                break;
        }
        return node;
    } // _parseTerm

    /**
     * This function takes a quad and processes it to fill the graph and mesh nodes.
     * @param {{subject: Term, predicate: Term, object: Term, graph: Term}} term
     * @returns {undefined}
     */
    function _processQuad({ subject, predicate, object, graph }) {
        const
            subj = _parseTerm(subject),
            pred = _prefixId(predicate.value),
            obj = meshed || object.termType !== 'NamedNode' || (blanks && object.termType === 'BlankNode')
                ? _parseTerm(object)
                : { '@id': _parseTerm(object)['@id'] };

        // add object to subject
        if (Array.isArray(subj[pred])) {
            subj[pred].push(obj);
        } else if (Reflect.has(subj, pred)) {
            subj[pred] = [subj[pred], obj];
        } else {
            subj[pred] = obj;
        }

        // move from missingMap to subjectMap, if necessary
        if (missingMap.has(subj['@id'])) {
            missingMap.delete(subj['@id']);
            subjectMap.set(subj['@id'], subj);
        }
    } // _processQuad

    // iterates over all quads, parses their terms and meshes them
    Array.from(dataset).forEach(_processQuad);
    if (blanks) blankMap.forEach(blankNode => subjectMap.set(blankNode['@id'], blankNode));
    return subjectMap;
}; // generateGraph

/**
 * TODO: this is a legacy method and should be reworked
 * Can be used to validate this dataset, if the given dataset contains shacl shapes.
 * @param {Dataset} dataset
 * @param {Dataset} shapeset
 * @returns {{conforms: boolean, results: Array, dataset: Dataset}} https://www.npmjs.com/package/rdf-validate-shacl
 */
factory.shaclValidate = function(dataset, shapeset) {
    const validator = new SHACLValidator(shapeset, {
        factory: Object.assign({}, dataFactory, factory)
    });
    return validator.validate(dataset);
}; // shaclValidate