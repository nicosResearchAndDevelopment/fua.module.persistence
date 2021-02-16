//interface DataStoreOptions {
//    url: string;
//    factory?: DataFactory;
//};
//
//interface DataStore extends EventEmitter {
//    constructor(options: DataStoreOptions): DataStore;
//    factory: DataFactory;
//
//    size(): Promise<number>;
//
//    match(subject?: Term, predicate?: Term, object?: Term, graph?: Term): Promise<Dataset>;
//
//    add(quads: Quad | Iterable<Quad>): Promise<number>;
//    addStream(stream: Readable<Quad>): Promise<number>;
//    delete(quads: Quad | Iterable<Quad>): Promise<number>;
//    deleteStream(stream: Readable<Quad>): Promise<number>;
//    deleteMatches(subject?: Term, predicate?: Term, object?: Term, graph?: Term): Promise<number>;
//
//    has(quads: Quad | Iterable<Quad>): Promise<boolean>;
//
//    on(event: "added", callback: (quad: Quad) => void): this;
//    on(event: "deleted", callback: (quad: Quad) => void): this;
//    on(event: "error", callback: (err: Error) => void): this;
//};

const
    _              = require('./util.js'),
    Dataset        = require('./Dataset.js'),
    DataFactory    = require('./DataFactory.js'),
    defaultFactory = new DataFactory();

class DataStore {

    constructor(options) {
        _.assert(new.target !== DataStore, 'DataStore#constructor : abstract class');
        _.assert(_.isObject(options), 'DataStore#constructor : invalid options', TypeError);
        _.assert(!options.url || _.isString(options.url), 'DataStore#constructor : invalid options.url', TypeError);
        _.assert(!options.factory || options.factory instanceof DataFactory, 'DataStore#constructor : invalid options.factory', TypeError);
        this.factory = options.factory || defaultFactory;
        _.lockProp(this, 'factory');
    } // DataStore#constructor

    async size() {
        _.assert(this.size !== DataStore.prototype.size, 'DataStore#size : abstract method');
        return 0;
    } // DataStore#size

    async match() {
        _.assert(this.match !== DataStore.prototype.match, 'DataStore#match : abstract method');
        return new Dataset(null, {factory: this.factory});
    } // DataStore#match

} // DataStore

module.exports = DataStore;