// TODO evaluate, whether Dataset and DatasetFactory should move from module.persistence.inmemory to here
// IDEA add the quad as last param to the QuadIndex, so it can be retrieved with entries
// IDEA delete a term by setting TermIndex#terms[key] to null, so you can recover it later and dont loose the proper key

const
    _ = require('./util.js'),
    dataFactory = require('./DataFactory.js'),
    model = exports,
    factory = require('./DatasetFactory.js');

/**
 * @class TermIndex
 */
model.TermIndex = class {

    constructor() {
        /** @type {number} */
        this.size = 0;
        /** @type {Object<string, number>} */
        this.keys = Object.create(null);
        /** @type {Object<number, Term>} */
        this.terms = Object.create(null);
        this.terms[0] = null;
    } // QuadIndex#constructor

    /**
     * @param {Term} term
     * @returns {number}
     */
    termToKey(term) {
        const id = factory.termToId(term);
        let key = this.keys[id];
        if (!key) {
            key = (this.keys[id] = ++this.size);
            this.terms[key] = term;
        }
        return key;
    } // TermIndex#termToKey

    /**
     * @param {Term} term
     * @returns {number|undefined}
     */
    getKey(term) {
        const id = factory.termToId(term);
        return this.keys[id];
    } // TermIndex#getKey

    /**
     * @param {number} key
     * @returns {Term|undefined}
     */
    getTerm(key) {
        return this.terms[key];
    } // TermIndex#getTerm

}; // TermIndex

/**
 * @class QuadIndex
 */
model.QuadIndex = class {

    constructor() {
        /** @type {number} */
        this.size = 0;
        /** @type {Object<number, Object<number, Object<number, Object<number, boolean>>>>} */
        this.graph = Object.create(null);
    } // QuadIndex#constructor

    /**
     * @param {number} key0
     * @param {number} key1
     * @param {number} key2
     * @param {number} key3
     * @returns {boolean}
     */
    add(key0, key1, key2, key3) {
        const index0 = this.graph;
        const index1 = index0[key0] || (index0[key0] = {});
        const index2 = index1[key1] || (index1[key1] = {});
        const index3 = index2[key2] || (index2[key2] = {});
        const exists = index3[key3];
        return !exists && (index3[key3] = true) && !!(++this.size);
    } // QuadIndex#add

    /**
     * @param {number} key0
     * @param {number} key1
     * @param {number} key2
     * @param {number} key3
     * @returns {boolean}
     */
    has(key0, key1, key2, key3) {
        const index0 = this.graph;
        const index1 = index0[key0];
        if (!index1) return false;
        const index2 = index1[key1];
        if (!index2) return false;
        const index3 = index2[key2];
        if (!index3) return false;
        const exists = index3[key3];
        return exists || false;
    } // QuadIndex#has

    /**
     * @param {number} key0
     * @param {number} key1
     * @param {number} key2
     * @param {number} key3
     * @returns {boolean}
     */
    delete(key0, key1, key2, key3) {
        const index0 = this.graph;
        const index1 = index0[key0];
        if (!index1) return false;
        const index2 = index1[key1];
        if (!index2) return false;
        const index3 = index2[key2];
        if (!index3) return false;
        const exists = index3[key3];
        if (!exists) return false;
        delete index3[key3];
        this.size--;
        for (const key in index3) return true;
        delete index2[key2];
        for (const key in index2) return true;
        delete index1[key1];
        for (const key in index1) return true;
        delete index0[key0];
        return true;
    } // QuadIndex#delete

    /**
     * @param {number} [key0]
     * @param {number} [key1]
     * @param {number} [key2]
     * @param {number} [key3]
     * @returns {Iterator<[number, number, number, number]>}
     */
    * entries(key0, key1, key2, key3) {
        const index0 = this.graph;
        const arr0 = key0 ? key0 in index0 ? [key0] : [] : Object.keys(index0);
        for (const key0 of arr0) {
            const index1 = index0[key0];
            const arr1 = key1 ? key1 in index1 ? [key1] : [] : Object.keys(index1);
            for (const key1 of arr1) {
                const index2 = index1[key1];
                const arr2 = key2 ? key2 in index2 ? [key2] : [] : Object.keys(index2);
                for (const key2 of arr2) {
                    const index3 = index2[key2];
                    const arr3 = key3 ? key3 in index3 ? [key3] : [] : Object.keys(index3);
                    for (const key3 of arr3) {
                        yield [key0, key1, key2, key3];
                    }
                }
            }
        }
    } // QuadIndex#entries

}; // QuadIndex

/**
 * @class Dataset
 */
model.Dataset = class {

    #terms = factory.termIndex();
    #quads = factory.quadIndex();

    * [Symbol.iterator]() {
        const
            termIndex = this.#terms,
            quadIndex = this.#quads,
            quadIterator = quadIndex.entries();
        for (let [graphKey, subjKey, predKey, objKey] of quadIterator) {
            const quad = dataFactory.quad(
                termIndex.getTerm(subjKey),
                termIndex.getTerm(predKey),
                termIndex.getTerm(objKey),
                termIndex.getTerm(graphKey)
            );
            yield quad;
        }
    }

    /** @type {number} */
    get size() {
        return this.#quads.size;
    } // Dataset#size

    /**
     * @param {Quad} quad
     * @returns {boolean}
     */
    add(quad) {
        _.assert(dataFactory.isQuad(quad), 'Dataset#add : invalid quad', TypeError);

        const
            termIndex = this.#terms,
            quadIndex = this.#quads,
            subjKey = termIndex.termToKey(quad.subject),
            predKey = termIndex.termToKey(quad.predicate),
            objKey = termIndex.termToKey(quad.object),
            graphKey = termIndex.termToKey(quad.graph),
            success = quadIndex.add(graphKey, subjKey, predKey, objKey);

        return success;
    } // Dataset#add

    /**
     * @param {Quad} quad
     * @returns {boolean}
     */
    has(quad) {
        _.assert(dataFactory.isQuad(quad), 'Dataset#has : invalid quad', TypeError);

        const
            termIndex = this.#terms,
            quadIndex = this.#quads,
            subjKey = termIndex.getKey(quad.subject),
            predKey = termIndex.getKey(quad.predicate),
            objKey = termIndex.getKey(quad.object),
            graphKey = termIndex.getKey(quad.graph),
            success = subjKey && predKey && objKey && graphKey
                && quadIndex.has(graphKey, subjKey, predKey, objKey);

        return success;
    } // Dataset#has

    /**
     * @param {Quad} quad
     * @returns {boolean}
     */
    delete(quad) {
        _.assert(dataFactory.isQuad(quad), 'Dataset#delete : invalid quad', TypeError);

        const
            termIndex = this.#terms,
            quadIndex = this.#quads,
            subjKey = termIndex.getKey(quad.subject),
            predKey = termIndex.getKey(quad.predicate),
            objKey = termIndex.getKey(quad.object),
            graphKey = termIndex.getKey(quad.graph),
            success = subjKey && predKey && objKey && graphKey
                && quadIndex.delete(graphKey, subjKey, predKey, objKey);

        return success;
    } // Dataset#delete

    /**
     * @param {Term} [subject]
     * @param {Term} [predicate]
     * @param {Term} [object]
     * @param {Term} [graph]
     * @returns {Dataset}
     */
    match(subject, predicate, object, graph) {
        _.assert(!subject || dataFactory.isSubject(subject), 'Dataset#match : invalid subject', TypeError);
        _.assert(!predicate || dataFactory.isPredicate(predicate), 'Dataset#match : invalid predicate', TypeError);
        _.assert(!object || dataFactory.isObject(object), 'Dataset#match : invalid object', TypeError);
        _.assert(!graph || dataFactory.isGraph(graph), 'Dataset#match : invalid graph', TypeError);

        const
            termIndex = this.#terms,
            quadIndex = this.#quads,
            subjKey = subject ? termIndex.getKey(subject) : undefined,
            predKey = predicate ? termIndex.getKey(predicate) : undefined,
            objKey = object ? termIndex.getKey(object) : undefined,
            graphKey = graph ? termIndex.getKey(graph) : undefined,
            dataset = factory.dataset();

        if (!subject !== !subjKey || !predicate !== !predKey || !object !== !objKey || !graph !== !graphKey)
            return dataset;

        const quadIterator = quadIndex.entries(graphKey, subjKey, predKey, objKey);
        for (let [graphKey, subjKey, predKey, objKey] of quadIterator) {
            dataset.add(dataFactory.quad(
                termIndex.getTerm(subjKey),
                termIndex.getTerm(predKey),
                termIndex.getTerm(objKey),
                termIndex.getTerm(graphKey)
            ));
        }

        return dataset;
    } // Dataset#match

}; // Dataset