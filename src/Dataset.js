//#region >> PRIVATE

const {
    _assert, _isString, _isObject
} = require('./util.js');

//#endregion << PRIVATE
//#region >> CLASSES

class QuadIndex {

    /**
     * @param {number} key0
     * @param {number} key1
     * @param {number} key2
     * @param {number} key3
     * @returns {boolean}
     */
    add(key0, key1, key2, key3) {
        const index0 = this;
        const index1 = index0[key0] || (index0[key0] = {});
        const index2 = index1[key1] || (index1[key1] = {});
        const index3 = index2[key2] || (index2[key2] = {});
        const exists = index3[key3] || (index3[key3] = true);
        return !exists;
    } // QuadIndex#add

    /**
     * @param {number} key0
     * @param {number} key1
     * @param {number} key2
     * @param {number} key3
     * @returns {boolean}
     */
    has(key0, key1, key2, key3) {
        const index0 = this;
        const index1 = index0[key0];
        if (!index1) return false;
        const index2 = index1[key1];
        if (!index2) return false;
        const index3 = index2[key2];
        if (!index3) return false;
        const exists = index3[key3];
        return exists || false;
    } // QuadIndex#has

    /**
     * @param {number} key0
     * @param {number} key1
     * @param {number} key2
     * @param {number} key3
     * @returns {boolean}
     */
    delete(key0, key1, key2, key3) {
        const index0 = this;
        const index1 = index0[key0];
        if (!index1) return false;
        const index2 = index1[key1];
        if (!index2) return false;
        const index3 = index2[key2];
        if (!index3) return false;
        const exists = index3[key3];
        if (!exists) return false;
        delete index3[key3];
        for (const key in index3) return true;
        delete index2[key2];
        for (const key in index2) return true;
        delete index1[key1];
        for (const key in index1) return true;
        delete index0[key0];
        return true;
    } // QuadIndex#delete

    /**
     * @param {number} [key0]
     * @param {number} [key1]
     * @param {number} [key2]
     * @param {number} [key3]
     * @returns {Iterator<[number, number, number, number]>}
     */
    * entries(key0, key1, key2, key3) {
        const index0 = this;
        const arr0 = key0 ? key0 in index0 ? [key0] : [] : Object.keys(index0);
        for (const key0 of arr0) {
            const index1 = index0[key0];
            const arr1 = key1 ? key1 in index1 ? [key1] : [] : Object.keys(index1);
            for (const key1 of arr1) {
                const index2 = index1[key1];
                const arr2 = key2 ? key2 in index2 ? [key2] : [] : Object.keys(index2);
                for (const key2 of arr2) {
                    const index3 = index2[key2];
                    const arr3 = key3 ? key3 in index3 ? [key3] : [] : Object.keys(index3);
                    for (const key3 of arr3) {
                        yield [key0, key1, key2, key3];
                    }
                }
            }
        }
    } // QuadIndex#entries

} // QuadIndex

class Dataset {

    // TODO evaluate, whether Dataset and DatasetFactory should move from module.persistence.inmemory to here

} // Dataset

//#endregion << CLASSES

module.exports = Dataset;