const
    _ = require('./util.js'),
    DatasetFactory = require('./DatasetFactory.js');

class Resource {

    constructor(id) {
        this['@id'] = id;
        _.lockProp(this, '@id');
    } // Resource#constructor

} // Resource

class Model {

    constructor(id, factory) {
        this['@id'] = id;
        this.factory = factory;
        _.lockProp(this, '@id', 'factory');
    } // Model#constructor

    build(resource, subject, dataset) {
        // TODO
    } // Model#build

} // Model

class ResourceFactory extends DatasetFactory {

    #default = Object.create(null);
    #types = new Map();

    constructor(context = {}) {
        super(context);
        this.#default.rdf_type = this.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    } // ResourceFactory#context

    model(type, modelClass) {
        _.assert(this.isNamedNode(type), 'ResourceFactory#model : invalid type', TypeError);
        _.assert(!this.#types.has(type.value), 'ResourceFactory#model : type already used');
        _.assert(_.isFunction(modelClass), 'ResourceFactory#model : invalid modelClass', TypeError);
        const model = new modelClass(type.value, this);
        _.assert(this.isModel(model), 'ResourceFactory#model : invalid model', TypeError);
        this.#types.set(type.value, model);
        return model;
    } // ResourceFactory#model

    isModel(model) {
        return model instanceof Model;
    } // ResourceFactory#isModel

    resource(subject, dataset) {
        _.assert(this.isNamedNode(subject), 'ResourceFactory#resource : invalid subject', TypeError);
        _.assert(this.isDataset(dataset), 'ResourceFactory#resource : invalid dataset', TypeError);

        const
            resource = new Resource(subject.value),
            types = Array.from(dataset.match(subject, this.#default.rdf_type))
                .map(({ object }) => this.#types.get(object.value))
                .filter(_.isTruthy);

        resource['@types'] = types;
        _.lockProp(this, '@types');

        for (let model of types) {
            model.build(resource, subject, dataset);
        }

        return resource;
    } // ResourceFactory#resource

    isResource(resource) {
        return resource instanceof Resource;
    } // ResourceFactory#isResource

    static get Model() {
        return Model;
    }

} // ResourceFactory

module.exports = ResourceFactory;