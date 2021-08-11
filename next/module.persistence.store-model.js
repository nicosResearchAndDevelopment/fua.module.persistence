const
    util          = require('./module.persistence.util.js'),
    DataModel     = require('./module.persistence.data-model.js'),
    FactoryModel  = require('./module.persistence.factory-model.js'),
    /** @namespace StoreModel */
    StoreModel    = exports;

/**
 * @class StoreModel.DeepObjectIndex
 * @template {number} Depth
 * @template {number|string|symbol} Key
 * @template {any} Value
 */
StoreModel.DeepObjectIndex = class DeepObjectIndex {

    /** @type {Depth} */
    #depth   = 0;
    /** @type {number} */
    #size    = 0;
    /** @type {{[key: Key]: object | Value}} */
    #entries = Object.create(null);

    /**
     * An Index that can store entries of key value pairs.
     * The keys for the Index must be integer numbers greater than zero and the values can be anything.
     * @param {Depth} depth The number of keys necessary for this Index instance.
     */
    constructor(depth) {
        util.assert(util.isInteger(depth) && depth > 0, 'DeepObjectIndex#constructor : expected depth to be a positive integer', TypeError);
        this.#depth = depth;
    } // DeepObjectIndex#constructor

    /**
     * The number of keys that are necessary for each entry.
     * @type {Depth}
     */
    get depth() {
        return this.#depth;
    } // DeepObjectIndex#depth

    /**
     * The number of entries in the Index.
     * @type {number}
     */
    get size() {
        return this.#size;
    } // DeepObjectIndex#size

    /**
     * Detect whether the keys already exist in the Index.
     * @param {...Key} keys The keys to check their existence.
     * @returns {boolean} The existence of the keys in the Index.
     */
    has(...keys) {
        util.assert(keys.length === this.#depth, 'DeepObjectIndex#has : expected as many keys as the depth of this index');
        let entry = this.#entries, depth = this.#depth;
        while (depth-- > 0) {
            let key = keys.shift();
            if (!(key in entry)) return false;
            entry = entry[key];
        }
        return true;
    } // DeepObjectIndex#has

    /**
     * Get the value for specific keys in the Index.
     * @param {...Key} keys The keys to get their value.
     * @returns {Value} The value for the keys in the Index.
     */
    get(...keys) {
        util.assert(keys.length === this.#depth, 'DeepObjectIndex#get : expected as many keys as the depth of this index');
        let entry = this.#entries, depth = this.#depth;
        while (depth-- > 0) {
            let key = keys.shift();
            if (!(key in entry))
                return undefined;
            entry = entry[key];
        }
        return entry;
    } // DeepObjectIndex#get

    /**
     * Add a value to the Index without overwriting it.
     * @param {...Key} keys The keys to insert the value at.
     * @param {Value} value The value to insert at those keys, if not already existing.
     * @returns {boolean} True if the keys have not existed yet and have been added.
     */
    add(...keys /*, value*/) {
        const value = keys.pop();
        util.assert(keys.length === this.#depth, 'DeepObjectIndex#add : expected as many keys as the depth of this index');
        let entry = this.#entries, depth = this.#depth;
        while (depth-- > 1) {
            let key = keys.shift();
            if (!(key in entry))
                entry[key] = Object.create(null);
            entry = entry[key];
        }
        let key = keys.shift();
        if (key in entry)
            return false;
        entry[key] = value;
        return true;
    } // DeepObjectIndex#add

    /**
     * Set a value in the Index and overwrite it if necessary.
     * @param {...Key} keys The keys to insert the value at.
     * @param {Value} value The value to insert at those keys, override if necessary.
     * @returns {boolean} True if the keys already existed and had to be overridden.
     */
    set(...keys /*, value*/) {
        const value = keys.pop();
        util.assert(keys.length === this.#depth, 'DeepObjectIndex#set : expected as many keys as the depth of this index');
        let entry = this.#entries, depth = this.#depth;
        while (depth-- > 1) {
            let key = keys.shift();
            if (!(key in entry))
                entry[key] = Object.create(null);
            entry = entry[key];
        }
        let key    = keys.shift(), override = (key in entry);
        entry[key] = value;
        return override;
    } // DeepObjectIndex#set

    /**
     * Delete the keys and their value in the Index.
     * @param {...Key} keys The keys to delete the value at.
     * @returns {boolean} True if the keys existed and the value had been deleted.
     */
    delete(...keys) {
        util.assert(keys.length === this.#depth, 'DeepObjectIndex#delete : expected as many keys as the depth of this index');
        let entry = this.#entries, depth = this.#depth, chain = [];
        while (depth-- > 0) {
            let key = keys.shift();
            if (!(key in entry))
                return false;
            chain.push([entry, key]);
            entry = entry[key];
        }
        cleanup: while (chain.length > 0) {
            let [entry, key] = chain.pop();
            delete entry[key];
            for (let other in entry)
                break cleanup;
        }
        return true;
    } // DeepObjectIndex#delete

    /**
     * Iterate over the entries of the Index with the use of an optional filter.
     * @param {...Key} keys The filter for the keys, a null or undefined as placeholder.
     * @returns {Iterator<[...Key, Value]>} An iterator over the matching entries, the keys as array followed by the value.
     */
    * entries(...keys) {
        util.assert(keys.length <= this.#depth, 'DeepObjectIndex#delete : expected no more keys than the depth of this index');
        // TODO
    } // DeepObjectIndex#entries

    /**
     * Iterate over the keys of the Index with the use of an optional filter.
     * @param {...Key} keys The filter for the keys, a null or undefined as placeholder.
     * @returns {Iterator<[...Key]>} An iterator over the matching keys as array.
     */
    * keys(...keys) {
        util.assert(keys.length <= this.#depth, 'DeepObjectIndex#delete : expected no more keys than the depth of this index');
        // TODO
    } // DeepObjectIndex#keys

    /**
     * Iterate over the values of the Index with the use of an optional filter.
     * @param {...Key} keys The filter for the keys, a null or undefined as placeholder.
     * @returns {Iterator<Value>} An iterator over the matching values.
     */
    * values(...keys) {
        util.assert(keys.length <= this.#depth, 'DeepObjectIndex#delete : expected no more keys than the depth of this index');
        // TODO
    } // DeepObjectIndex#values

}; // DeepObjectIndex

/**
 * @class StoreModel.BidirectionalObjectIndex
 * @template {number|string|symbol} Key
 * @template {number|string|symbol} Value
 */
StoreModel.BidirectionalObjectIndex = class BidirectionalObjectIndex {

    /** @type {number} */
    #size       = 0;
    /** @type {{[key: Key]: Value}} */
    #keyToValue = Object.create(null);
    /** @type {{[value: Value]: Key}} */
    #valueToKey = Object.create(null);

    /**
     * The number of entries in the Index.
     * @type {number}
     */
    get size() {
        return this.#size;
    } // BidirectionalObjectIndex#size

    /**
     * Add a key-value-pair to the Index without overwriting it.
     * @param {Key} key The key to insert the value at, if not already existing.
     * @param {Value} value The value to insert at that key, if not already existing.
     * @returns {boolean} True if the key and value have not existed yet and have been added.
     */
    addEntry(key, value) {
        if (key in this.#keyToValue) return false;
        if (value in this.#valueToKey) return false;
        this.#keyToValue[key]   = value;
        this.#valueToKey[value] = key;
        this.#size++;
        return true;
    } // BidirectionalObjectIndex#addEntry

    /**
     * Detect whether a key already exists in the Index.
     * @param {Key} key The key to check its existence.
     * @returns {boolean} The existence of the key in the Index.
     */
    hasKey(key) {
        return (key in this.#keyToValue);
    } // BidirectionalObjectIndex#hasKey

    /**
     * Detect whether a value already exists in the Index.
     * @param {Value} value The value to check its existence.
     * @returns {boolean} The existence of the value in the Index.
     */
    hasValue(value) {
        return (value in this.#valueToKey);
    } // BidirectionalObjectIndex#hasValue

    /**
     * Get the value for a specific key in the Index.
     * @param {Key} key The key to get its value.
     * @returns {Value} The value for the key in the Index.
     */
    getValue(key) {
        if (!(key in this.#keyToValue)) return undefined;
        return this.#keyToValue[key];
    } // BidirectionalObjectIndex#getValue

    /**
     * Get the key for a specific value in the Index.
     * @param {Value} value The value to get its key.
     * @returns {Key} The key for the value in the Index.
     */
    getKey(value) {
        if (!(value in this.#valueToKey)) return undefined;
        return this.#valueToKey[value];
    } // BidirectionalObjectIndex#getKey

    /**
     * Delete the key and its value in the Index.
     * @param {Key} key The key to delete.
     * @returns {boolean} True if the key existed and the value had been deleted.
     */
    deleteKey(key) {
        if (!(key in this.#keyToValue)) return false;
        delete this.#keyToValue[key];
        this.#size--;
        return true;
    } // BidirectionalObjectIndex#deleteKey

    /**
     * Delete the value and its key in the Index.
     * @param {Value} value The value to delete.
     * @returns {boolean} True if the value existed and the key had been deleted.
     */
    deleteValue(value) {
        if (!(value in this.#valueToKey)) return false;
        delete this.#valueToKey[value];
        this.#size--;
        return true;
    } // BidirectionalObjectIndex#deleteValue

    /**
     * Iterate over the entries of the Index.
     * @returns {Iterator<[Key, Value]>} An iterator over the entries, the key followed by the value as array.
     */
    * entries() {
        for (let key in this.#keyToValue) {
            const value = this.#keyToValue[key];
            yield [key, value];
        }
    } // DeepObjectIndex#entries

    /**
     * Iterate over the keys of the Index.
     * @returns {Iterator<Key>} An iterator over the keys.
     */
    * keys() {
        for (let key in this.#keyToValue) {
            yield key;
        }
    } // DeepObjectIndex#keys

    /**
     * Iterate over the values of the Index.
     * @returns {Iterator<Value>} An iterator over the values.
     */
    * values() {
        for (let value in this.#valueToKey) {
            yield value;
        }
    } // DeepObjectIndex#values

}; // BidirectionalObjectIndex

/**
 * @class StoreModel.Dataset
 * @see https://rdf.js.org/dataset-spec/#dataset-interface
 */
StoreModel.Dataset = class Dataset {

    /** @type {StoreModel.BidirectionalObjectIndex<number, string>} */
    #termIndex     = new StoreModel.BidirectionalObjectIndex();
    /** @type {StoreModel.DeepObjectIndex<4, number, boolean>} */
    #quadIndex     = new StoreModel.DeepObjectIndex(4);
    /** @type {number} */
    #lastIndexUsed = -1;
    /** @type {{[key: number]: number}} */
    #indexUsage    = Object.create(null);

    /**
     * @param {Iterable<DataModel.Quad>} [quads]
     * @param {FactoryModel.TermFactory} [factory]
     */
    constructor(quads, factory) {
        util.assert(!quads || util.isIterable(quads), 'Dataset#constructor : invalid quads', TypeError);
        util.assert(!factory || factory instanceof FactoryModel.TermFactory, 'Dataset#constructor : invalid factory', TypeError);

        /** @type {FactoryModel.TermFactory} */
        this.factory = factory || new FactoryModel.TermFactory();
        util.lockProp(this, 'factory');

        if (quads) for (let quad of quads) {
            this.add(quad);
        }
    } // Dataset#constructor

    /**
     * @returns {{[prefix: string]: string}}
     */
    context() {
        const
            contextEntries = Object.entries(this.factory.context()),
            resultContext  = {};

        for (let termStr of this.#termIndex.values()) {
            if (contextEntries.length === 0) break;
            const
                term        = this.factory.fromString(termStr),
                isNamedNode = (term instanceof DataModel.NamedNode),
                isLiteral   = !isNamedNode && (term instanceof DataModel.Literal);

            if (!(isNamedNode || isLiteral)) break;
            const term_iri = isLiteral ? term.datatype.value : term.value;
            for (let index = 0; index < contextEntries.length; index++) {
                const [prefix, iri] = contextEntries[index];
                if (term_iri.startsWith(prefix + ':')) {
                    resultContext[prefix] = iri;
                    contextEntries.splice(index, 1);
                    break;
                }
            }
        }

        return resultContext;
    } // Dataset#context

    /**
     * @type {number}
     */
    get size() {
        return this.#quadIndex.size;
    } // Dataset#size

    // TODO https://rdf.js.org/dataset-spec/#datasetcore-interface
    // - [@@iterator](): Iterator<Quad>
    // - add(quad: Quad): boolean (?? Dataset)
    // - delete(quad: Quad): boolean (?? Dataset)
    // - has(quad: Quad): boolean
    // - match(subject: Term, predicate: Term, object: Term, graph: Term): Dataset
    // TODO https://rdf.js.org/dataset-spec/#dataset-interface
    // - addAll
    // - deleteMatches
    // - import
    // - difference
    // - intersection
    // - union
    // - forEach
    // - filter
    // - map
    // - reduce
    // - every
    // - some
    // - contains
    // - equals
    // - toStream
    // - toString
    // - toCanonical

}; // StoreModel.Dataset

/**
 * @abstract
 * @class StoreModel.DataStore
 */
StoreModel.DataStore = class DataStore {

    // TODO
    // TODO https://rdf.js.org/stream-spec/#store-interface

}; // StoreModel.DataStore

module.exports = StoreModel;
