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

### Data Model

#### Term

```ts
/**
 * @typedef {"NamedNode"|"BlankNode"|"Literal"|"Variable"|"DefaultGraph"|"Quad"} TermType
 * @pattern /^(?:NamedNode|BlankNode|Literal|Variable|DefaultGraph|Quad)$/
 */
interface Term {
    termType: TermType;
    value: string;
    equals(other?: Term): boolean;
};
```

#### NamedNode

```ts
/**
 * @typedef {string} IriString
 * @pattern /^\w+:\S+$/
 */
interface NamedNode extends Term {
    termType: "NamedNode";
    value: IriString;
};
```

#### BlankNode

```ts
/**
 * @typedef {string} IdString
 * @pattern /^\S+$/
 */
interface BlankNode extends Term {
    termType: "BlankNode";
    value: IdString;
};
```

#### Literal

```ts
/**
 * @typedef {string} LangString
 * @pattern /^[a-z]{2}(?:-[a-z]{2})?$/i
 */
interface Literal extends Term {
    termType: "Literal";
    value: string;
    language?: LangString;
    datatype: NamedNode;
    equals(other?: Literal): boolean;
};
```

#### Variable

```ts
/**
 * @typedef {string} NameString
 * @pattern /^[a-z]\w*$/i
 */
interface Variable extends Term {
    termType: "Variable";
    value: NameString;
};
```

#### DefaultGraph

```ts
interface DefaultGraph extends Term {
    termType: "DefaultGraph";
    value: "";
};
```

#### Quad

```ts
interface Quad extends Term {
    termType: "Quad";
    value: "";
    subject: NamedNode | BlankNode | Variable;
    predicate: NamedNode | Variable;
    object: NamedNode | BlankNode | Literal | Variable;
    graph: DefaultGraph | NamedNode | Variable;
    equals(other?: Quad): boolean;
};
```

### Parsing Model

> __REM:__
> - to parse between textual representations and quads (or datasets/quad iterables)
> - to pipe between textual streams and quad streams
> - supported representations: ttl, n3, rdf-xml, json-ld, n-quads
> - to parse between singular quads/terms and other formats
> - should replace termToId/termFromId methods
> - tokenization with [tokenizr](https://www.npmjs.com/package/tokenizr)
> - to generate a meshed graph structure from a dataset/quad stream

#### NQuadParser

```ts
interface NQuadParser {
    // TODO
};
```

> TODO

### Persistence Model

#### Dataset

```ts
interface Dataset extends Iterable<Quad> {
    // attributes
    size: number;
    
    // extracting methods
    forEach(iteratee: (quad: Quad, dataset: Dataset) => void): void;
    filter(iteratee: (quad: Quad, dataset: Dataset) => boolean): Dataset;
    map(iteratee: (quad: Quad, dataset: Dataset) => Quad): Dataset;
    reduce(iteratee: (acc: any, quad: Quad, dataset: Dataset) => Quad, acc?: any): any;
    
    match(subject?: Term, predicate?: Term, object?: Term, graph?: Term): Dataset;
    union(other: Dataset): Dataset;
    intersection(other: Dataset): Dataset;
    difference(other: Dataset): Dataset;
    
    quads(): Iterator<Quad>;
    toArray(): Array<Quad>;
    toStream(): Readable<Quad>;
    
    // mutating methods
    add(quads: Quad | Iterable<Quad>): number;
    addStream(stream: Readable<Quad>): Promise<number>;
    delete(quads: Quad | Iterable<Quad>): number;
    deleteStream(stream: Readable<Quad>): Promise<number>;
    deleteMatches(subject?: Term, predicate?: Term, object?: Term, graph?: Term): number;

    // boolean operators
    has(quads: Quad | Iterable<Quad>): boolean;
    equals(other: Dataset): boolean;
    contains(other: Dataset): boolean;
    every(iteratee: (quad: Quad, dataset: Dataset) => boolean): boolean;
    some(iteratee: (quad: Quad, dataset: Dataset) => boolean): boolean;
};
```

#### DataStore

```ts
interface DataStore extends EventEmitter {
    // attribute queries
    size(): Promise<number>;

    // extracting queries
    match(subject?: Term, predicate?: Term, object?: Term, graph?: Term): Promise<Dataset>;
    
    // mutating queries
    add(quads: Quad | Iterable<Quad>): Promise<number>;
    addStream(stream: Readable<Quad>): Promise<number>;
    delete(quads: Quad | Iterable<Quad>): Promise<number>;
    deleteStream(stream: Readable<Quad>): Promise<number>;
    deleteMatches(subject?: Term, predicate?: Term, object?: Term, graph?: Term): Promise<number>;
    
    // boolean operators
    has(quads: Quad | Iterable<Quad>): Promise<boolean>;
    
    // events
    on(event: "added", callback: (quad: Quad) => void): this;
    on(event: "deleted", callback: (quad: Quad) => void): this;
    on(event: "error", callback: (err: Error) => void): this;
};
```

### Factory Model

#### DataFactory

```ts
/**
 * @typedef {string} TermIdentifier
 */
interface DataFactory {
    namedNode(iri: string): NamedNode;
    blankNode(id?: string): BlankNode;
    literal(value: string,  langOrDt?: string | NamedNode): Literal;
    variable(name: string): Variable;
    defaultGraph(): DefaultGraph;
    quad(subject: Term, predicate: Term, object: Term, graph?: Term): Quad;
    
    fromTerm(original: Term): Term;
    fromQuad(original: Quad): Quad;

    isTerm(that: Term | any): true | false;
    isNamedNode(that: NamedNode | any): true | false;
    isBlankNode(that: BlankNode | any): true | false;
    isLiteral(that: Literal | any): true | false;
    isVariable(that: Variable | any): true | false;
    isDefaultGraph(that: DefaultGraph | any): true | false;
    isQuad(that: Quad | any): true | false;
    
    isSubject(that: NamedNode | BlankNode | Variable | any): true | false;
    isPredicate(that: NamedNode | Variable | any): true | false;
    isObject(that: NamedNode | BlankNode | Literal | Variable | any): true | false;
    isGraph(that: DefaultGraph | NamedNode | Variable | any): true | false;
};
```

#### DatasetFactory

```ts
interface DatasetFactory {
    dataset(quads?: Iterable<Quad>): Dataset;
    isDataset(that: Dataset | any): true | false;
    
    termToId(term: Term): TermIdentifier;
    termFromId(termId: TermIdentifier): Term;
    
    // TODO: where to put the previously extended dataset methods?
    shaclValidate(data: Dataset, shapes: Dataset): Dataset;
    generateGraph(source: Dataset, prefixes: Object<string, IriString>, options?: { compact?: boolean, meshed?: boolean, blanks?: boolean}): Map<IriString, Object>;
    // REM: parsers should provide methods to import or export other formats
};
```

#### DataStoreFactory

```ts
interface DataStoreFactory {
    dataStore(options: Object): DataStore;
    isDataStore(that: DataStore | any): true | false;
    
    validSubject(that: Term | any): true | false;
    validPredicate(that: Term | any): true | false;
    validObject(that: Term | any): true | false;
    validGraph(that: Term | any): true | false;
    validQuad(that: Quad | any): true | false;
};
```
