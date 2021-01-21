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
    // TODO
};
```

```ts
interface DataSource {
    // TODO
};
```

```ts
interface DataSink {
    // TODO
};
```

```ts
interface DataStoreCore extends DataSource, DataSink, EventEmitter {
    // TODO
};
```