const
    Dataset = require('./Dataset.js'),
    { _assert } = require('./util.js');

function isDataset(that) {
    return that instanceof Dataset;
} // isDataset

/**
 * @param {Iterable<Quad>} quads
 * @returns {Dataset}
 */
function dataset(quads) {
    return new Dataset(quads);
} // dataset

module.exports = {
    dataset, isDataset
}; // exports