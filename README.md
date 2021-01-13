# module.persistence

- [InMemory](../module.persistence.inmemory)
- [FileSystem](../module.persistence.filesystem)
- [Redis](../module.persistence.redis)
- [MongoDB](../module.persistence.mongodb)
- [Neo4j](../module.persistence.neo4j)

## Interface

- [RDF/JS: Data model specification](http://rdf.js.org/data-model-spec/)

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
};
```
