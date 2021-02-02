// TODO evaluate, whether Dataset and DatasetFactory should move from module.persistence.inmemory to here
// IDEA add the quad as last param to the QuadIndex, so it can be retrieved with entries
// IDEA delete a term by setting TermIndex#terms[key] to null, so you can recover it later and dont loose the proper key

const
    _ = require('./util.js'),
    dataFactory = require('./DataFactory.js'),
    model = exports,
    factory = require('./DatasetFactory.js'),
    { Readable } = require('stream');

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
        this.graph[''] = {}; // DefaultGraph
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

    /** @type {number} */
    get size() {
        return this.#quads.size;
    } // Dataset#size

    /**
     * @param {function (quad: Quad, dataset: Dataset): void} iteratee
     * @returns {void}
     */
    forEach(iteratee) {
        _.assert(_.isFunction(iteratee), 'Dataset#forEach : invalid iteratee', TypeError);
        for (let quad of this) {
            iteratee(quad, this);
        }
    } // Dataset#forEach

    /**
     * @param {function (quad: Quad, dataset: Dataset): boolean} iteratee
     * @returns {Dataset}
     */
    filter(iteratee) {
        _.assert(_.isFunction(iteratee), 'Dataset#filter : invalid iteratee', TypeError);
        const result = factory.dataset();
        for (let quad of this) {
            if (iteratee(quad, this))
                result.add(quad);
        }
        return result;
    } // Dataset#filter

    /**
     * @param {function (quad: Quad, dataset: Dataset): Quad} iteratee
     * @returns {Dataset}
     */
    map(iteratee) {
        _.assert(_.isFunction(iteratee), 'Dataset#map : invalid iteratee', TypeError);
        const result = factory.dataset();
        for (let quad of this) {
            result.add(iteratee(quad, this));
        }
        return result;
    } // Dataset#map

    /**
     * @param {function (acc: any, quad: Quad, dataset: Dataset): Quad} iteratee
     * @param {*} [acc]
     * @returns {Dataset}
     */
    reduce(iteratee, acc) {
        _.assert(_.isFunction(iteratee), 'Dataset#reduce : invalid iteratee', TypeError);
        let pipeAcc = (acc === undefined);
        for (let quad of this) {
            if (pipeAcc) {
                pipeAcc = false;
                acc = quad;
            } else {
                iteratee(acc, quad, this);
            }
        }
        return acc;
    } // Dataset#reduce

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
            result = factory.dataset();

        if (!subject !== !subjKey || !predicate !== !predKey || !object !== !objKey || !graph !== !graphKey)
            return result;

        const quadIterator = quadIndex.entries(graphKey, subjKey, predKey, objKey);
        for (let [graphKey, subjKey, predKey, objKey] of quadIterator) {
            result.add(dataFactory.quad(
                termIndex.getTerm(subjKey),
                termIndex.getTerm(predKey),
                termIndex.getTerm(objKey),
                termIndex.getTerm(graphKey)
            ));
        }

        return result;
    } // Dataset#match

    /**
     * @param {Dataset} other
     * @returns {Dataset}
     */
    union(other) {
        _.assert(factory.isDataset(other), 'Dataset#union : invalid other', TypeError);
        const result = factory.dataset();
        for (let quad of this) {
            result.add(quad);
        }
        for (let quad of other) {
            result.add(quad);
        }
        return result;
    } // Dataset#union

    /**
     * @param {Dataset} other
     * @returns {Dataset}
     */
    intersection(other) {
        _.assert(factory.isDataset(other), 'Dataset#intersection : invalid other', TypeError);
        const result = factory.dataset();
        for (let quad of this) {
            if (other.has(quad))
                result.add(quad);
        }
        return result;
    } // Dataset#intersection

    /**
     * @param {Dataset} other
     * @returns {Dataset}
     */
    difference(other) {
        _.assert(factory.isDataset(other), 'Dataset#difference : invalid other', TypeError);
        const result = factory.dataset();
        for (let quad of this) {
            if (!other.has(quad))
                result.add(quad);
        }
        for (let quad of other) {
            if (!this.has(quad))
                result.add(quad);
        }
        return result;
    } // Dataset#difference

    /**
     * @returns {Iterator<Quad>}
     */
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
    } // Dataset#@@iterator

    /**
     * @returns {Iterator<Quad>}
     */
    quads() {
        return this[Symbol.iterator]();
    } // Dataset#quads

    /**
     * @returns {Array<Quad>}
     */
    toArray() {
        return Array.from(this);
    } // Dataset#toArray

    /**
     * @returns {Readable<Quad>}
     */
    toStream() {
        return Readable.from(this);
    } // Dataset#toStream

    /**
     * @param {Quad|Iterable<Quad>} quads
     * @returns {number}
     */
    add(quads) {
        /** @type {Array<Quad>} */
        const quadArr = dataFactory.isQuad(quads) ? [quads] : _.isArray(quads) ? quads : Array.from(quads);
        _.assert(quadArr.every(dataFactory.isQuad), 'Dataset#add : invalid quads', TypeError);

        const
            termIndex = this.#terms,
            quadIndex = this.#quads;

        let addCount = 0;
        for (let quad of quadArr) {
            const
                subjKey = termIndex.termToKey(quad.subject),
                predKey = termIndex.termToKey(quad.predicate),
                objKey = termIndex.termToKey(quad.object),
                graphKey = termIndex.termToKey(quad.graph);

            if (quadIndex.add(graphKey, subjKey, predKey, objKey))
                addCount++;
        }

        return addCount;
    } // Dataset#add

    /**
     * @param {Readable<Quad>} stream
     * @returns {Promise<number>}
     */
    async addStream(stream) {
        const quads = [];
        await new Promise((resolve) => {
            stream.on('data', quad => quads.push(quad));
            stream.on('end', resolve);
        });
        return this.add(quads);
    } // Dataset#addStream

    /**
     * @param {Quad|Iterable<Quad>} quads
     * @returns {boolean}
     */
    delete(quads) {
        /** @type {Array<Quad>} */
        const quadArr = dataFactory.isQuad(quads) ? [quads] : _.isArray(quads) ? quads : Array.from(quads);
        _.assert(quadArr.every(dataFactory.isQuad), 'Dataset#delete : invalid quads', TypeError);

        const
            termIndex = this.#terms,
            quadIndex = this.#quads;

        let delCount = 0;
        for (let quad of quadArr) {
            const
                subjKey = termIndex.termToKey(quad.subject),
                predKey = termIndex.termToKey(quad.predicate),
                objKey = termIndex.termToKey(quad.object),
                graphKey = termIndex.termToKey(quad.graph);

            if (subjKey && predKey && objKey && graphKey
                && quadIndex.delete(graphKey, subjKey, predKey, objKey))
                delCount++;
        }

        return delCount;
    } // Dataset#delete

    /**
     * @param {Readable<Quad>} stream
     * @returns {Promise<number>}
     */
    async deleteStream(stream) {
        const quads = [];
        await new Promise((resolve) => {
            stream.on('data', quad => quads.push(quad));
            stream.on('end', resolve);
        });
        return this.delete(quads);
    } // Dataset#deleteStream

    /**
     * @param {Term} [subject]
     * @param {Term} [predicate]
     * @param {Term} [object]
     * @param {Term} [graph]
     * @returns {number}
     */
    deleteMatches(subject, predicate, object, graph) {
        _.assert(!subject || dataFactory.isSubject(subject), 'Dataset#deleteMatches : invalid subject', TypeError);
        _.assert(!predicate || dataFactory.isPredicate(predicate), 'Dataset#deleteMatches : invalid predicate', TypeError);
        _.assert(!object || dataFactory.isObject(object), 'Dataset#deleteMatches : invalid object', TypeError);
        _.assert(!graph || dataFactory.isGraph(graph), 'Dataset#deleteMatches : invalid graph', TypeError);

        const
            termIndex = this.#terms,
            quadIndex = this.#quads,
            subjKey = subject ? termIndex.getKey(subject) : undefined,
            predKey = predicate ? termIndex.getKey(predicate) : undefined,
            objKey = object ? termIndex.getKey(object) : undefined,
            graphKey = graph ? termIndex.getKey(graph) : undefined;

        if (!subject !== !subjKey || !predicate !== !predKey || !object !== !objKey || !graph !== !graphKey)
            return 0;

        const quadIterator = quadIndex.entries(graphKey, subjKey, predKey, objKey);
        let delCount = 0;
        for (let [graphKey, subjKey, predKey, objKey] of quadIterator) {
            if (quadIndex.delete(graphKey, subjKey, predKey, objKey))
                delCount++;
        }

        return delCount;
    } // Dataset#deleteMatches

    /**
     * @param {Quad|Iterable<Quad>} quads
     * @returns {boolean}
     */
    has(quads) {
        /** @type {Array<Quad>} */
        const quadArr = dataFactory.isQuad(quads) ? [quads] : _.isArray(quads) ? quads : Array.from(quads);
        _.assert(quadArr.every(dataFactory.isQuad), 'Dataset#has : invalid quads', TypeError);

        const
            termIndex = this.#terms,
            quadIndex = this.#quads;

        for (let quad of quadArr) {
            const
                subjKey = termIndex.termToKey(quad.subject),
                predKey = termIndex.termToKey(quad.predicate),
                objKey = termIndex.termToKey(quad.object),
                graphKey = termIndex.termToKey(quad.graph);

            if (!(subjKey && predKey && objKey && graphKey
                && quadIndex.has(graphKey, subjKey, predKey, objKey)))
                return false;
        }

        return true;
    } // Dataset#has

    /**
     * @param {Dataset} other
     * @returns {boolean}
     */
    equals(other) {
        _.assert(factory.isDataset(other), 'Dataset#equals : invalid other', TypeError);
        return this.has(other) && other.has(this);
    } // Dataset#equals

    /**
     * @param {Dataset} other
     * @returns {boolean}
     */
    contains(other) {
        _.assert(factory.isDataset(other), 'Dataset#contains : invalid other', TypeError);
        return this.has(other);
    } // Dataset#contains

    /**
     * @param {function(quad: Quad, dataset: Dataset): boolean} iteratee
     * @returns {boolean}
     */
    every(iteratee) {
        _.assert(_.isFunction(iteratee), 'Dataset#every : invalid iteratee', TypeError);
        for (let quad of this) {
            if (!iteratee(quad, this))
                return false;
        }
        return true;
    } // Dataset#every

    /**
     * @param {function(quad: Quad, dataset: Dataset): boolean} iteratee
     * @returns {boolean}
     */
    some(iteratee) {
        _.assert(_.isFunction(iteratee), 'Dataset#some : invalid iteratee', TypeError);
        for (let quad of this) {
            if (iteratee(quad, this))
                return true;
        }
        return false;
    } // Dataset#some

}; // Dataset