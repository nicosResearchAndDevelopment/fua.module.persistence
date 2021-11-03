const
    _              = require('./module.persistence.util.js'),
    {EventEmitter} = require('events'),
    {Readable}     = require('stream'),
    Dataset        = require('./module.persistence.Dataset.js'),
    DataFactory    = require('./module.persistence.DataFactory.js'),
    defaultFactory = new DataFactory();

/** @alias fua.module.persistence.DataStore */
class DataStore extends EventEmitter {

    /**
     * @param {Object} options
     * @param {DataFactory} [factory]
     * @abstract
     */
    constructor(options, factory) {
        _.assert(new.target !== DataStore, 'DataStore#constructor : abstract class');
        _.assert(_.isObject(options), 'DataStore#constructor : invalid options', TypeError);
        _.assert(!factory || factory instanceof DataFactory, 'DataStore#constructor : invalid factory', TypeError);
        super();
        this.factory = factory || defaultFactory;
        _.lockProp(this, 'factory');
    } // DataStore#constructor

    /**
     * @returns {Promise<number>}
     * @abstract
     * @interface
     */
    async size() {
        _.assert(this.size !== DataStore.prototype.size, 'DataStore#size : abstract method');
    } // DataStore#size

    /**
     * @param {Term} [subject]
     * @param {Term} [predicate]
     * @param {Term} [object]
     * @param {Term} [graph]
     * @returns {Promise<Dataset>}
     * @abstract
     * @interface
     */
    async match(subject, predicate, object, graph) {
        _.assert(this.match !== DataStore.prototype.match, 'DataStore#match : abstract method');
        _.assert(!subject || this.factory.validSubject(subject), 'DataStore#match : invalid subject', TypeError);
        _.assert(!predicate || this.factory.validPredicate(predicate), 'DataStore#match : invalid predicate', TypeError);
        _.assert(!object || this.factory.validObject(object), 'DataStore#match : invalid object', TypeError);
        _.assert(!graph || this.factory.validGraph(graph), 'DataStore#match : invalid graph', TypeError);
        return new Dataset(null, this.factory);
    } // DataStore#match

    /**
     * @param {Quad|Iterable<Quad>} quads
     * @returns {Promise<number>}
     * @abstract
     * @interface
     */
    async add(quads) {
        _.assert(this.add !== DataStore.prototype.add, 'DataStore#add : abstract method');
        const quadArr = this.factory.isQuad(quads) ? [quads] : _.isArray(quads) ? quads : Array.from(quads);
        _.assert(quadArr.every(this.factory.validQuad.bind(this.factory)), 'DataStore#add : invalid quads', TypeError);
        return quadArr;
    } // DataStore#add

    /**
     * @param {Readable<Quad>} stream
     * @returns {Promise<number>}
     * @abstract
     * @interface
     */
    async addStream(stream) {
        _.assert(this.addStream !== DataStore.prototype.addStream, 'DataStore#addStream : abstract method');
        _.assert(stream instanceof Readable, 'DataStore#addStream : invalid stream', TypeError);
        return stream;
    } // DataStore#addStream

    /**
     * @param {Quad|Iterable<Quad>} quads
     * @returns {Promise<number>}
     * @abstract
     * @interface
     */
    async delete(quads) {
        _.assert(this.delete !== DataStore.prototype.delete, 'DataStore#delete : abstract method');
        const quadArr = this.factory.isQuad(quads) ? [quads] : _.isArray(quads) ? quads : Array.from(quads);
        _.assert(quadArr.every(this.factory.validQuad.bind(this.factory)), 'DataStore#delete : invalid quads', TypeError);
        return quadArr;
    } // DataStore#delete

    /**
     * @param {Readable<Quad>} stream
     * @returns {Promise<number>}
     * @abstract
     * @interface
     */
    async deleteStream(stream) {
        _.assert(this.deleteStream !== DataStore.prototype.deleteStream, 'DataStore#deleteStream : abstract method');
        _.assert(stream instanceof Readable, 'DataStore#deleteStream : invalid stream', TypeError);
        return stream;
    } // DataStore#deleteStream

    /**
     * @param {Term} [subject]
     * @param {Term} [predicate]
     * @param {Term} [object]
     * @param {Term} [graph]
     * @returns {Promise<number>}
     * @abstract
     * @interface
     */
    async deleteMatches(subject, predicate, object, graph) {
        _.assert(this.deleteMatches !== DataStore.prototype.deleteMatches, 'DataStore#deleteMatches : abstract method');
        _.assert(!subject || this.factory.validSubject(subject), 'DataStore#deleteMatches : invalid subject', TypeError);
        _.assert(!predicate || this.factory.validPredicate(predicate), 'DataStore#deleteMatches : invalid predicate', TypeError);
        _.assert(!object || this.factory.validObject(object), 'DataStore#deleteMatches : invalid object', TypeError);
        _.assert(!graph || this.factory.validGraph(graph), 'DataStore#deleteMatches : invalid graph', TypeError);
    } // DataStore#deleteMatches

    /**
     * @param {Quad|Iterable<Quad>} quads
     * @returns {Promise<boolean>}
     * @abstract
     * @interface
     */
    async has(quads) {
        _.assert(this.has !== DataStore.prototype.has, 'DataStore#has : abstract method');
        const quadArr = this.factory.isQuad(quads) ? [quads] : _.isArray(quads) ? quads : Array.from(quads);
        _.assert(quadArr.every(this.factory.validQuad.bind(this.factory)), 'DataStore#has : invalid quads', TypeError);
        return quadArr;
    } // DataStore#has

    /**
     * @param {"added"|"deleted"|"error"} event
     * @param {function} callback
     * @returns {this}
     */
    on(event, callback) {
        _.assert(_.isString(event), 'DataStore#on : invalid event', TypeError);
        _.assert(_.isFunction(callback), 'DataStore#on : invalid callback', TypeError);
        _.assert(['added', 'deleted', 'error'].includes(event), 'DataStore#on : unsupported event ' + event);
        return super.on(event, callback);
    } // DataStore#on

    /**
     * @param {function} callback
     * @returns {this}
     */
    onAdded(callback) {
        _.assert(_.isFunction(callback), 'DataStore#onAdded : invalid callback', TypeError);
        return super.on('added', callback);
    } // DataStore#onAdded

    /**
     * @param {function} callback
     * @returns {this}
     */
    onDeleted(callback) {
        _.assert(_.isFunction(callback), 'DataStore#onDeleted : invalid callback', TypeError);
        return super.on('deleted', callback);
    } // DataStore#onDeleted

    /**
     * @param {function} callback
     * @returns {this}
     */
    onError(callback) {
        _.assert(_.isFunction(callback), 'DataStore#onError : invalid callback', TypeError);
        return super.on('error', callback);
    } // DataStore#onError

} // DataStore

module.exports = DataStore;
