const
    { isQuad, isSubject, isPredicate, isObject, isGraph } = require('./DataModel.js'),
    dataFactory = require('./DataFactory.js');

//#region >> PRIVATE

const {
    _assert, _isString, _isObject
} = require('./util.js');

//#endregion << PRIVATE
//#region >> CLASSES

class TermIndex {

    constructor() {
        this.size = 0;
        this.keys = Object.create(null);
        this.terms = Object.create(null);
    } // QuadIndex#constructor

    /**
     * @param {Term} term
     * @returns {string}
     */
    termToId(term) {
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
                return this.termToId(term.subject) + ' '
                    + this.termToId(term.predicate) + ' '
                    + this.termToId(term.object) + ' '
                    + this.termToId(term.graph) + ' .';
        }
    } // TermIndex#termToId

    /**
     * @param {Term} term
     * @returns {number}
     */
    termToKey(term) {
        const id = this.termToId(term);
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
        const id = this.termToId(term);
        return this.keys[id];
    } // TermIndex#getKey

    /**
     * @param {number} key
     * @returns {Term|undefined}
     */
    getTerm(key) {
        return this.terms[key];
    } // TermIndex#getTerm

} // TermIndex

class QuadIndex {

    constructor() {
        this.size = 0;
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

} // QuadIndex

class Dataset {

    #terms = new TermIndex();
    #quads = new QuadIndex();

    // TODO evaluate, whether Dataset and DatasetFactory should move from module.persistence.inmemory to here

    * [Symbol.iterator]() {
        const
            termIndex = this.#terms,
            quadIndex = this.#quads,
            quadIterator = quadIndex.entries();
        for (let [graphKey, subjKey, predKey, objKey] of quadIterator) {
            yield dataFactory.quad(
                termIndex.getTerm(subjKey),
                termIndex.getTerm(predKey),
                termIndex.getTerm(objKey),
                termIndex.getTerm(graphKey)
            );
        }
    }

    /** @type {number} */
    get size() {
        return this.#quads.size;
    }

    /**
     * @param {Quad} quad
     * @returns {boolean}
     */
    add(quad) {
        _assert(isQuad(quad), 'Dataset#add : invalid quad', TypeError);

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
        _assert(isQuad(quad), 'Dataset#has : invalid quad', TypeError);

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
        _assert(isQuad(quad), 'Dataset#delete : invalid quad', TypeError);

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
        _assert(!subject || isSubject(subject), 'Dataset#match : invalid subject', TypeError);
        _assert(!predicate || isPredicate(predicate), 'Dataset#match : invalid predicate', TypeError);
        _assert(!object || isObject(object), 'Dataset#match : invalid object', TypeError);
        _assert(!graph || isGraph(graph), 'Dataset#match : invalid graph', TypeError);

        const
            termIndex = this.#terms,
            quadIndex = this.#quads,
            subjKey = subject ? termIndex.getKey(subject) : undefined,
            predKey = predicate ? termIndex.getKey(predicate) : undefined,
            objKey = object ? termIndex.getKey(object) : undefined,
            graphKey = graph ? termIndex.getKey(graph) : undefined,
            dataset = new Dataset();

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

} // Dataset

//#endregion << CLASSES

module.exports = Dataset;