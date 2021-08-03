const
    util         = require('./module.persistence.util.js'),
    DataModel    = require('./module.persistence.data-model.js'),
    FactoryModel = require('./module.persistence.factory-model.js'),
    /** @namespace StoreModel */
    StoreModel   = exports;

/**
 * @class DeepObjectIndex
 * @memberOf StoreModel
 * @template {number} Depth
 * @template {any} Value
 */
StoreModel.DeepObjectIndex = class DeepObjectIndex {

    /** @type {Depth} */
    #depth   = 0;
    /** @type {number} */
    #size    = 0;
    /** @type {object} */
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
     * @param {...number} keys The keys to check their existence.
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
     * @param {...number} keys The keys to get their value.
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
     * @param {...number} keys The keys to insert the value at.
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
     * @param {...number} keys The keys to insert the value at.
     * @param {Value} value The value to insert at those keys, override if necessary.
     * @returns {boolean} True if the keys already existed and had to be overriden.
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
     * Delete the keys at their value in the Index.
     * @param {...number} keys The keys to delete the value at.
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
     * @param {...number} keys The filter for the keys, a zero as placeholder.
     * @returns {Iterator<[Value, ...number]>} An iterator over the matching entries, the value followed by the keys as array.
     */
    * entries(...keys) {
        util.assert(keys.length <= this.#depth, 'DeepObjectIndex#delete : expected no more keys than the depth of this index');
        // TODO
    } // DeepObjectIndex#entries

    /**
     * Iterate over the keys of the Index with the use of an optional filter.
     * @param {...number} keys The filter for the keys, a zero as placeholder.
     * @returns {Iterator<[...number]>} An iterator over the matching keys as array.
     */
    * keys(...keys) {
        util.assert(keys.length <= this.#depth, 'DeepObjectIndex#delete : expected no more keys than the depth of this index');
        // TODO
    } // DeepObjectIndex#keys

    /**
     * Iterate over the values of the Index with the use of an optional filter.
     * @param {...number} keys The filter for the keys, a zero as placeholder.
     * @returns {Iterator<Value>} An iterator over the matching values.
     */
    * values(...keys) {
        util.assert(keys.length <= this.#depth, 'DeepObjectIndex#delete : expected no more keys than the depth of this index');
        // TODO
    } // DeepObjectIndex#values

}; // DeepObjectIndex

/**
 * @class StringIndex
 * @memberOf StoreModel
 */
StoreModel.StringIndex = class StringIndex {

    /** @type {object} */
    #entries = Object.create(null);

    // IDEA => TODO

}; // StringIndex

/**
 * @class Dataset
 * @memberOf StoreModel
 * @see https://rdf.js.org/dataset-spec/#dataset-interface
 */
StoreModel.Dataset = class Dataset {

    /** @type {StoreModel.DeepObjectIndex<4>} */
    #quadIndex = new StoreModel.DeepObjectIndex(4);
    /** @type {StoreModel.StringIndex} */
    #termIndex   = new StoreModel.StringIndex();

    // TODO

}; // StoreModel.Dataset

/**
 * @abstract
 * @class DataStore
 * @memberOf StoreModel
 */
StoreModel.DataStore = class DataStore {

    // TODO

}; // StoreModel.DataStore

module.exports = StoreModel;
