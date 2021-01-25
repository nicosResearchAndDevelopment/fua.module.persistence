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
 * @typedef {string} UriString
 * @pattern /^\w+:\S+$/
 */
interface NamedNode extends Term {
    termType: "NamedNode";
    value: UriString
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
    value: IdString
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
    value: string,
    language?: LangString,
    datatype: NamedNode
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
    value: NameString
};
```

#### DefaultGraph

```ts
interface DefaultGraph extends Term {
    termType: "DefaultGraph";
    value: ""
};
```

#### Quad

```ts
interface Quad extends Term {
    termType: "Quad";
    value: "",
    subject: NamedNode | BlankNode | Variable,
    predicate: NamedNode | Variable,
    object: NamedNode | BlankNode | Literal | Variable,
    graph: DefaultGraph | NamedNode | Variable
};
```

#### DataQuad

- NOTE: still to be evaluated
    - maybe good
    - maybe other method to sort out variables
    - maybe kick out variables
    - maybe leave it to the stores

```ts
interface DataQuad extends Quad {
    subject: NamedNode | BlankNode,
    predicate: NamedNode,
    object: NamedNode | BlankNode | Literal,
    graph: DefaultGraph | NamedNode
};
```

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
    match(subject?: Term, predicate?: Term, object?: Term, graph?: Term): Dataset;
    union(other: Dataset): Dataset;
    intersection(other: Dataset): Dataset;
    difference(other: Dataset): Dataset;
    
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
    
    // output alternatives
    toArray(): Array<Quad>;
    toStream(): Readable<Quad>;
    toString(): string;
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

### Parser Model

- TODO

### Factory Model

#### DataFactory

```ts
interface DataFactory {
    namedNode(uri: string): NamedNode;
    blankNode(id?: string): BlankNode;
    literal(value: string,  langOrDt?: string | NamedNode): Literal;
    variable(name: string): Variable;
    defaultGraph(): DefaultGraph;
    quad(subject: Term, predicate: Term, object: Term, graph?: Term): Quad;
    
    fromTerm(original: Term): Term;
    fromQuad(original: Quad): Quad;
    // fromString(termStr: string): Term;
    
    isNamedNode(that: NamedNode | any): true | false;
    isBlankNode(that: BlankNode | any): true | false;
    isLiteral(that: Literal | any): true | false;
    isVariable(that: Variable | any): true | false;
    isDefaultGraph(that: DefaultGraph | any): true | false;
    isQuad(that: Quad | any): true | false;
    
    isSubject(that: NamedNode | BlankNode | Variable | any): true | false;
    isPredicate(that: NamedNode | Variable | any): true | false;
    isObject(that: NamedNode | BlankNode | Variable | Literal | any): true | false;
    isGraph(that: NamedNode | DefaultGraph | any): true | false;

    // NOTE: still to be evaluated
    isData(that: NamedNode | BlankNode | Literal | DefaultGraph | any): true | false;
    isDataQuad(that: Quad | DataQuad | any): true | false;
    isDataSubject(that: NamedNode | BlankNode | any): true | false;
    isDataPredicate(that: NamedNode | any): true | false;
    isDataObject(that: NamedNode | BlankNode | Literal | any): true | false;
    isDataGraph(that: NamedNode | DefaultGraph | any): true | false;

    // NOTE: still to be evaluated
    termToString(term: Term): string;
    termFromString(termStr: string): Term;
};
```

#### DatasetFactory

```ts
interface DatasetFactory {
    dataset(quads?: Iterable<Quad>): Dataset;
    isDataset(that: Dataset | any): true | false;
};
```

#### DataStoreFactory

```ts
interface DataStoreFactory {
    dataStore(options: object): DataStore;
    isDataStore(that: DataStore | any): true | false;
};
```
