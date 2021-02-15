# NOTES

## Fragen

- Sollte die DatasetFactory eine TermFactory zur Term-Generierung akzeptieren?
  - > Nein, das wird schwierig und unklar. Es wäre eine Möglichkeit keine DatasetFactory zu benutzen
    und stattdessen die Dataset Klasse so anzubieten.
- Ist es schlimm, wenn die ResourceFactory beliebig Ressourcen erzeugt?
  - > Wenn möglich sollte das Ressourcenmanagement einer anderen Entität überlassen werden, 
    zum Beispiel dem Space. An sich sollte es möglich sein dieselbe Ressource mehrmals zu erstellen.
- Was geschieht mit den erzeugten Ressourcen, wie ist deren Life-Cycle?
    - Wann wird sie immer erzeugt?
    - Wie viele Ressourcen gibt es gleichzeitig?
      - > Die ResourceFactory hat in der Regel kein Wissen über die Ressourcen im Umlauf.
    - Wie lange bleibt sie bestehen, wie lange ist sie verwendbar?
      - > Da sollte sich die ResourceFactory nicht drum kümmern müssen.
    - Was ist mit Referenzen zu anderen Ressourcen?
    - Welche Daten liegen bei der Erzeugung zugrunde?
    - Welcher Mechanismus gibt die Ressource wieder frei?
        - > Da sollte sich die ResourceFactory nicht drum kümmern müssen.
    - Wie findet die Manipulation der Ressource statt?
    - Reflektiert die Ressource den tatsächlichen Stand der Daten?
    - Woher weiß man, ob eine Ressource noch aktuell ist?
    - Braucht die Ressource oder das Model eine Reference auf den Space?
    - Wie geschieht die Anbindung der Resource zur Persistenz?
  
## Interface

```ts
interface Model {
    '@id': string;
    
    build(resource, subject): Promise<void>;
};

interface Resource extends EventEmitter {
    '@id': string;
    '@type': Array<Model>;
    
    data: Dataset;
    
    // events
    on(event: "added", callback: (predicate: Term, object: Term) => void): this;
    on(event: "deleted", callback: (predicate: Term, object: Term) => void): this;
};
```