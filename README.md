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

### DataModel

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

```ts
interface DefaultGraph extends Term {
    termType: "DefaultGraph";
    value: ""
};
```

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

```ts
interface DataQuad extends Quad {
    subject: NamedNode | BlankNode,
    predicate: NamedNode,
    object: NamedNode | BlankNode | Literal,
    graph: DefaultGraph | NamedNode
};
```

### DataFactory

```ts
interface DataFactoryCore {
    namedNode(uri: string): NamedNode;
    blankNode(id?: string): BlankNode;
    literal(value: string,  langOrDt?: string | NamedNode): Literal;
    variable(name: string): Variable;
    defaultGraph(): DefaultGraph;
    quad(subject: Term, predicate: Term, object: Term, graph?: Term): Quad;
    
    fromTerm(original: Term): Term;
    fromQuad(original: Quad): Quad;
};
```

```ts
interface DataFactory extends DataFactoryCore {
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
    
    termToString(term: Term): string;
    termFromString(termStr: string): Term;
    fromString(termStr: string): Term;
};
```

### Dataset

```ts
interface DatasetCore extends Iterable<Quad> {
    size: number;
    add(quad: Quad): boolean;
    delete(quad: Quad): boolean;
    has(quad: Quad): boolean;
    match(subject?: Term, predicate?: Term, object?: Term, graph?: Term): DatasetCore;
};
```

```ts
interface DatasetCoreFactory {
    dataset(quads?: Iterable<Quad>): DatasetCore;
};
```

```ts
interface Dataset extends DatasetCore {
    addAll(quads: Iterable<Quad>): Dataset;
    contains(other: Dataset): boolean;
    deleteMatches(subject?: Term, predicate?: Term, object?: Term, graph?: Term): Dataset;
    difference(other: Dataset): Dataset;
    equals(other: Dataset): boolean;
    every(iteratee: (quad: Quad, dataset: Dataset) => boolean): boolean;
    filter(iteratee: (quad: Quad, dataset: Dataset) => boolean): Dataset;
    forEach(iteratee: (quad: Quad, dataset: Dataset) => void): void;
    import(stream: DataStream): Promise<Dataset>;
    intersection(other: Dataset): Dataset;
    map(iteratee: (quad: Quad, dataset: Dataset) => Quad): Dataset;
    reduce(iteratee: (acc: any, quad: Quad, dataset: Dataset) => any): any;
    some(iteratee: (quad: Quad, dataset: Dataset) => boolean): boolean;
    toArray(): Array<Quad>;
    toCanonical(): string;
    toStream(): DataStream;
    toString(): string;
    union(other: Dataset): Dataset;
};
```

### DataStore (Variant 1)

```ts
interface DataStoreCore extends DatasetCore, EventEmitter {
    size(): Promise<number>;
    add(quad: Quad): Promise<boolean>;
    delete(quad: Quad): Promise<boolean>;
    has(quad: Quad): Promise<boolean>;
    match(subject?: Term, predicate?: Term, object?: Term, graph?: Term): Promise<DatasetCore>;
};
```

```ts
interface DataStoreCoreFactory {
    store(graph: NamedNode): DataStoreCore;
};
```

### DataStore (Variant 2)

```ts
interface DataStream extends EventEmitter {
    on(event: "prefix", callback: (prefix: string, ns: NamedNode) => void): DataStream;
    on(event: "data", callback: (data: Quad) => void): DataStream;
    on(event: "error", callback: (err: Error) => void): DataStream;
    on(event: "end", callback: () => void): DataStream;
};
```

```ts
interface ResultEmitter extends EventEmitter {
    on(event: "error", callback: (err: Error) => void): DataStream;
    on(event: "end", callback: () => void): DataStream;
};
```

```ts
interface DataSource {
    match(subject?: Term, predicate?: Term, object?: Term, graph?: Term): DataStream;
};
```

```ts
interface DataSink {
    import(stream: DataStream): ResultEmitter;
};
```

```ts
interface DataStoreCore extends DataSource, DataSink {
    remove(stream: DataStream): ResultEmitter;
    removeMatches(subject?: Term, predicate?: Term, object?: Term, graph?: Term): ResultEmitter;
    deleteGraph(graph: Term | string): ResultEmitter;
};
```

```ts
interface DataStore extends EventEmitter {
	import(dataset: Dataset): Promise;
	match(subject?: Term, predicate?: Term, object?: Term, graph?: Term): Promise<Dataset>;
	remove(dataset: Dataset): Promise;
	removeMatches(subject?: Term, predicate?: Term, object?: Term, graph?: Term): Promise;
};
```