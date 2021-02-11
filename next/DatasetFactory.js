const
    _ = require('./util.js'),
    TermFactory = require('./TermFactory.js'),
    Dataset = require('./Dataset.js');

class DatasetFactory extends TermFactory {

    dataset(quads) {
        const dataset = new Dataset(this);
        if (quads) dataset.add(quads);
        return dataset;
    } // DatasetFactory#dataset

    isDataset(dataset) {
        return dataset instanceof Dataset;
    } // DatasetFactory#isDataset

} // DatasetFactory

module.exports = DatasetFactory;