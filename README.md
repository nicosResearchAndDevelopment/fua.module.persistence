# module.persistence

- [InMemory](https://git02.int.nsc.ag/Research/fua/lib/module.persistence.inmemory)
- [FileSystem](https://git02.int.nsc.ag/Research/fua/lib/module.persistence.filesystem)
- [Redis](https://git02.int.nsc.ag/Research/fua/lib/module.persistence.redis)
- [MongoDB](https://git02.int.nsc.ag/Research/fua/lib/module.persistence.mongodb)
- [Neo4j](https://git02.int.nsc.ag/Research/fua/lib/module.persistence.neo4j)

## Interfaces

- [RDF/JS: Data model specification](http://rdf.js.org/data-model-spec/)
- [RDF/JS: Dataset specification](https://rdf.js.org/dataset-spec/)
- [RDF/JS: Stream interfaces](https://rdf.js.org/stream-spec/)

### TermFactory

```ts
interface Term {
    termType: string;
    value: string;
    equals(other?: Term): boolean;
    toString(): string;
};

interface NamedNode extends Term {
    termType: "NamedNode";
    value: string;
};

interface BlankNode extends Term {
    termType: "BlankNode";
    value: string;
};

interface Literal extends Term {
    termType: "Literal";
    value: string;
    language: string;
    datatype: NamedNode;
};

interface Variable extends Term {
    termType: "Variable";
    value: string;
};

interface DefaultGraph extends Term {
    termType: "DefaultGraph";
    value: "";
};

interface Quad extends Term {
    termType: "Quad";
    value: "";
    subject: NamedNode | BlankNode | Variable;
    predicate: NamedNode | Variable;
    object: NamedNode | BlankNode | Literal | Variable;
    graph: DefaultGraph | NamedNode | Variable;
};

interface Context {
    [prefix: string]: string;
};

interface TermFactory {
    constructor(context?: Context): TermFactory;
    context(): Context;
    
    namedNode(iri: string): NamedNode;
    blankNode(id?: string): BlankNode;
    literal(value: string, langOrDt?: string | NamedNode): Literal;
    variable(name: string): Variable;
    defaultGraph(): DefaultGraph;
    tripel(subject: Term, predicate: Term, object: Term): Quad;
    quad(subject: Term, predicate: Term, object: Term, graph?: Term): Quad;

    fromTerm(original: Term): Term;
    fromQuad(original: Quad): Quad;
    fromString(termStr: string): Term;
    
    // TODO rethink resolve methods -> intended to get un-prefixed terms for serialization
    // IDEA use an arbitrary factory as second parameter resolve terms and quads, maybe with defaultFactory
    resolveTerm(term: Term): Term;
    resolveQuad(quad: Quad): Quad;

    isTerm(that: Term | any): boolean;
    isNamedNode(that: NamedNode | any): boolean;
    isBlankNode(that: BlankNode | any): boolean;
    isLiteral(that: Literal | any): boolean;
    isVariable(that: Variable | any): boolean;
    isDefaultGraph(that: DefaultGraph | any): boolean;
    isTripel(that: Quad | any): boolean;
    isQuad(that: Quad | any): boolean;
    
    validSubject(that: NamedNode | BlankNode | Variable | any): boolean;
    validPredicate(that: NamedNode | Variable | any): boolean;
    validObject(that: NamedNode | BlankNode | Literal | Variable | any): boolean;
    validGraph(that: DefaultGraph | NamedNode | Variable | any): boolean;
    validQuad(that: Quad | any): boolean;
};

interface DataFactory extends TermFactory {
    variable(): null;

    validSubject(that: NamedNode | BlankNode | any): boolean;
    validPredicate(that: NamedNode | Variable | any): boolean;
    validObject(that: NamedNode | BlankNode | Literal | any): boolean;
    validQuad(that: DefaultGraph | NamedNode | any): boolean;
};
```

### Dataset

```ts
interface Context {
    [prefix: string]: string;
};

interface Dataset extends Iterable<Quad> {
    constructor(quads?: Iterable<Quad>, factory?: TermFactory): Dataset;
    factory: TermFactory;
    context(): Context;
    
    size: number;
    
    forEach(iteratee: (quad: Quad, dataset: Dataset) => void): void;
    filter(iteratee: (quad: Quad, dataset: Dataset) => boolean): Dataset;
    map(iteratee: (quad: Quad, dataset: Dataset) => Quad): Dataset;
    reduce(iteratee: (acc: any, quad: Quad, dataset: Dataset) => Quad, acc?: any): any;

    match(subject?: Term, predicate?: Term, object?: Term, graph?: Term): Dataset;
    union(other: Dataset): Dataset;
    intersection(other: Dataset): Dataset;
    difference(other: Dataset): Dataset;

    [Symbol.iterator](): Iterator<Quad>;
    quads(): Iterator<Quad>;
    toArray(): Array<Quad>;
    toStream(): Readable<Quad>;

    add(quads: Quad | Iterable<Quad>): number;
    addStream(stream: Readable<Quad>): Promise<number>;
    delete(quads: Quad | Iterable<Quad>): number;
    deleteStream(stream: Readable<Quad>): Promise<number>;
    deleteMatches(subject?: Term, predicate?: Term, object?: Term, graph?: Term): number;

    has(quads: Quad | Iterable<Quad>): boolean;
    equals(other: Dataset): boolean;
    contains(other: Dataset): boolean;
    every(iteratee: (quad: Quad, dataset: Dataset) => boolean): boolean;
    some(iteratee: (quad: Quad, dataset: Dataset) => boolean): boolean;
};
```

### DataStore

```ts
interface DataStore extends EventEmitter {
    constructor(options: Object, factory?: DataFactory): DataStore;
    factory: DataFactory;
    
    size(): Promise<number>;

    match(subject?: Term, predicate?: Term, object?: Term, graph?: Term): Promise<Dataset>;

    add(quads: Quad | Iterable<Quad>): Promise<number>;
    addStream(stream: Readable<Quad>): Promise<number>;
    delete(quads: Quad | Iterable<Quad>): Promise<number>;
    deleteStream(stream: Readable<Quad>): Promise<number>;
    deleteMatches(subject?: Term, predicate?: Term, object?: Term, graph?: Term): Promise<number>;

    has(quads: Quad | Iterable<Quad>): Promise<boolean>;

    on(event: "added", callback: (quad: Quad) => void): this;
    on(event: "deleted", callback: (quad: Quad) => void): this;
    on(event: "error", callback: (err: Error) => void): this;
};
```

### Transformer

> __NOTES SPE:__
> 
> Parsers:
> - from TTL to Quads
> - from JSON-LD to Quads
> 
> Serializers:
> - Quads to TTL
> - Quads to JSON-LD
> 
> Transformers:
> - Quads to Graph-Data-Structure
> - Dataset to Shacl-Report