// SCHEMA: [<(IriString)> | _:(IdString) | ?(NameString) | ["(string)" | '(string)' | """(string)""" | '''(string)'''] + [@(LangString) | ^^(IriString)]? | (IriString)] [Space | End ] [Dot + End]? [Other]
// => the order is important and matched the different types of terms separated with spaces
// => some values must be combined later, but this ensures that only one regex is required for all terms and every syntax
// => if [Dot + End]? got matched, it shows the ending of an n3 string and can be ignored
// => if [Other] got matched, it shows an invalid syntax
const _termStringMatcher = /(?:<(\S+)>|_:(\S+)|\?(\S+)|(?:"([^"\s]*)"|'([^'\s]*)'|"""([^.]*?)"""|'''([^.]*?)''')(?:(?:@(\S+))|(?:\^\^(\S+)))?|(\w\S*))(?=\s|$)(?:\s*\.\s*$)?|\S+/g;

// more specific ALTERNATIVE:
// const _termStringMatcher = /(?:<(\w+:\S+)>|_:(\S+)|\?([a-z]\w*)|(?:"([^"\s]*?)"|'([^'\s]*?)'|"""([^.]*?)"""|'''([^.]*?)''')(?:(?:@([a-z]{2}(?:-[a-z]{2})?))|(?:\^\^(\w+:\S+)))?|(\w+:\S+))(?=\s|$)(?:\s*\.\s*$)?|\S+/ig;

// the _termMatchExtractor arguments fit the ()-bracket-matchers of _termStringMatcher
function _termMatchExtractor(match, m_namedNode1, m_blankNode, m_variable, m_literal1, m_literal2, m_literal3, m_literal4, m_lang, m_dt, m_namedNode2) {
    let m_namedNode = m_namedNode1 || m_namedNode2;
    if (m_namedNode) return {
        termType: 'NamedNode',
        value: m_namedNode
    };
    if (m_blankNode) return {
        termType: 'BlankNode',
        value: m_blankNode
    };
    if (m_variable) return {
        termType: 'Variable',
        value: m_variable
    };
    let m_literal = m_literal1 || m_literal2 || m_literal3 || m_literal4;
    _assert(_isString(m_literal), 'fromString : invalid match : ' + match);
    return {
        termType: 'Literal',
        value: m_literal,
        language: m_lang ? m_lang : undefined,
        datatype: m_dt ? {
            termType: 'NamedNode',
            value: m_dt
        } : undefined
    };
} // _termMatchExtractor

/**
 * @param {string} termStr
 * @returns {Term}
 */
function fromString(termStr) {
    _assert(_isString(termStr), 'fromString : invalid termStr', TypeError);
    const resultParts = Array.from(termStr.matchAll(_termStringMatcher))
        .map(termMatch => _termMatchExtractor(...termMatch));

    _assert(resultParts.length > 0, 'fromString : no match');
    if (resultParts.length === 1) {
        return fromTerm(resultParts[0]);
    } else {
        _assert(resultParts.length === 3 || resultParts.length === 4, 'fromString : invalid match count : ' + resultParts.length);
        return fromQuad({
            subject: resultParts[0],
            predicate: resultParts[1],
            object: resultParts[2],
            graph: resultParts[3]
        });
    }
} // fromString