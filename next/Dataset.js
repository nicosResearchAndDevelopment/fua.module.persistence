const
    _ = require('./util.js'),
    TermFactory = require('./TermFactory.js'),
    { Readable } = require('stream'),
    defaultFactory = new TermFactory();

// IDEA add the quad as last param to the QuadIndex, so it can be retrieved with entries
// IDEA delete a term by setting TermIndex#terms[key] to null, so you can recover it later and dont loose the proper key

class TermIndex {

    constructor() {
        this.size = 0;
        this.keys = Object.create(null);
        this.terms = Object.create(null);
        this.terms[0] = null;
    } // QuadIndex#constructor

    termToKey(term) {
        const id = term.toString();
        let key = this.keys[id];
        if (!key) {
            key = (this.keys[id] = ++this.size);
            this.terms[key] = term;
        }
        return key;
    } // TermIndex#termToKey

    getKey(term) {
        const id = term.toString();
        return this.keys[id];
    } // TermIndex#getKey

    getTerm(key) {
        return this.terms[key];
    } // TermIndex#getTerm

} // TermIndex

class QuadIndex {

    constructor() {
        this.size = 0;
        this.graph = Object.create(null);
        this.graph[''] = {}; // DefaultGraph
    } // QuadIndex#constructor

    add(key0, key1, key2, key3) {
        const index0 = this.graph;
        const index1 = index0[key0] || (index0[key0] = {});
        const index2 = index1[key1] || (index1[key1] = {});
        const index3 = index2[key2] || (index2[key2] = {});
        const exists = index3[key3];
        return !exists && (index3[key3] = true) && !!(++this.size);
    } // QuadIndex#add

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

    constructor(factory = defaultFactory) {
        _.assert(factory instanceof TermFactory, 'Dataset#constructor : invalid factory', TypeError);
        this.factory = factory;
        _.lockProp(this, 'factory');
    } // Dataset#constructor

    get size() {
        return this.#quads.size;
    } // Dataset#size

    forEach(iteratee) {
        _.assert(_.isFunction(iteratee), 'Dataset#forEach : invalid iteratee', TypeError);
        for (let quad of this) {
            iteratee(quad, this);
        }
    } // Dataset#forEach

    filter(iteratee) {
        _.assert(_.isFunction(iteratee), 'Dataset#filter : invalid iteratee', TypeError);
        const result = new Dataset();
        for (let quad of this) {
            if (iteratee(quad, this))
                result.add(quad);
        }
        return result;
    } // Dataset#filter

    map(iteratee) {
        _.assert(_.isFunction(iteratee), 'Dataset#map : invalid iteratee', TypeError);
        const result = new Dataset();
        for (let quad of this) {
            result.add(iteratee(quad, this));
        }
        return result;
    } // Dataset#map

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

    match(subject, predicate, object, graph) {
        _.assert(!subject || this.factory.isSubject(subject), 'Dataset#match : invalid subject', TypeError);
        _.assert(!predicate || this.factory.isPredicate(predicate), 'Dataset#match : invalid predicate', TypeError);
        _.assert(!object || this.factory.isObject(object), 'Dataset#match : invalid object', TypeError);
        _.assert(!graph || this.factory.isGraph(graph), 'Dataset#match : invalid graph', TypeError);

        const
            termIndex = this.#terms,
            quadIndex = this.#quads,
            subjKey = subject ? termIndex.getKey(subject) : undefined,
            predKey = predicate ? termIndex.getKey(predicate) : undefined,
            objKey = object ? termIndex.getKey(object) : undefined,
            graphKey = graph ? termIndex.getKey(graph) : undefined,
            result = new Dataset();

        if (!subject !== !subjKey || !predicate !== !predKey || !object !== !objKey || !graph !== !graphKey)
            return result;

        const quadIterator = quadIndex.entries(graphKey, subjKey, predKey, objKey);
        for (let [graphKey, subjKey, predKey, objKey] of quadIterator) {
            result.add(this.factory.quad(
                termIndex.getTerm(subjKey),
                termIndex.getTerm(predKey),
                termIndex.getTerm(objKey),
                termIndex.getTerm(graphKey)
            ));
        }

        return result;
    } // Dataset#match

    union(other) {
        _.assert(other instanceof Dataset, 'Dataset#union : invalid other', TypeError);
        const result = new Dataset();
        for (let quad of this) {
            result.add(quad);
        }
        for (let quad of other) {
            result.add(quad);
        }
        return result;
    } // Dataset#union

    intersection(other) {
        _.assert(other instanceof Dataset, 'Dataset#intersection : invalid other', TypeError);
        const result = new Dataset();
        for (let quad of this) {
            if (other.has(quad))
                result.add(quad);
        }
        return result;
    } // Dataset#intersection

    difference(other) {
        _.assert(other instanceof Dataset, 'Dataset#difference : invalid other', TypeError);
        const result = new Dataset();
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

    * [Symbol.iterator]() {
        const
            termIndex = this.#terms,
            quadIndex = this.#quads,
            quadIterator = quadIndex.entries();
        for (let [graphKey, subjKey, predKey, objKey] of quadIterator) {
            const quad = this.factory.quad(
                termIndex.getTerm(subjKey),
                termIndex.getTerm(predKey),
                termIndex.getTerm(objKey),
                termIndex.getTerm(graphKey)
            );
            yield quad;
        }
    } // Dataset#@@iterator

    quads() {
        return this[Symbol.iterator]();
    } // Dataset#quads

    toArray() {
        return Array.from(this);
    } // Dataset#toArray

    toStream() {
        return Readable.from(this);
    } // Dataset#toStream

    add(quads) {
        /** @type {Array<Quad>} */
        const quadArr = this.factory.isQuad(quads) ? [quads] : _.isArray(quads) ? quads : Array.from(quads);
        _.assert(quadArr.every(this.factory.isQuad), 'Dataset#add : invalid quads', TypeError);

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

    async addStream(stream) {
        const quads = [];
        await new Promise((resolve) => {
            stream.on('data', quad => quads.push(quad));
            stream.on('end', resolve);
        });
        return this.add(quads);
    } // Dataset#addStream

    delete(quads) {
        /** @type {Array<Quad>} */
        const quadArr = this.factory.isQuad(quads) ? [quads] : _.isArray(quads) ? quads : Array.from(quads);
        _.assert(quadArr.every(this.factory.isQuad), 'Dataset#delete : invalid quads', TypeError);

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

    async deleteStream(stream) {
        const quads = [];
        await new Promise((resolve) => {
            stream.on('data', quad => quads.push(quad));
            stream.on('end', resolve);
        });
        return this.delete(quads);
    } // Dataset#deleteStream

    deleteMatches(subject, predicate, object, graph) {
        _.assert(!subject || this.factory.isSubject(subject), 'Dataset#deleteMatches : invalid subject', TypeError);
        _.assert(!predicate || this.factory.isPredicate(predicate), 'Dataset#deleteMatches : invalid predicate', TypeError);
        _.assert(!object || this.factory.isObject(object), 'Dataset#deleteMatches : invalid object', TypeError);
        _.assert(!graph || this.factory.isGraph(graph), 'Dataset#deleteMatches : invalid graph', TypeError);

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

    has(quads) {
        /** @type {Array<Quad>} */
        const quadArr = this.factory.isQuad(quads) ? [quads] : _.isArray(quads) ? quads : Array.from(quads);
        _.assert(quadArr.every(this.factory.isQuad), 'Dataset#has : invalid quads', TypeError);

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

    equals(other) {
        _.assert(other instanceof Dataset, 'Dataset#equals : invalid other', TypeError);
        return this.has(other) && other.has(this);
    } // Dataset#equals

    contains(other) {
        _.assert(other instanceof Dataset, 'Dataset#contains : invalid other', TypeError);
        return this.has(other);
    } // Dataset#contains

    every(iteratee) {
        _.assert(_.isFunction(iteratee), 'Dataset#every : invalid iteratee', TypeError);
        for (let quad of this) {
            if (!iteratee(quad, this))
                return false;
        }
        return true;
    } // Dataset#every

    some(iteratee) {
        _.assert(_.isFunction(iteratee), 'Dataset#some : invalid iteratee', TypeError);
        for (let quad of this) {
            if (iteratee(quad, this))
                return true;
        }
        return false;
    } // Dataset#some

} // Dataset

module.exports = Dataset;