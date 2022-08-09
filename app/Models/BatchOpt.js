'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class BatchOpt extends Model {
    static get table() {
        return 'pxOptBatches.batchOpt'
    }

    static get createdAtColumn() {
        return null
    }
    static get updatedAtColumn() {
        return null
    }

    static get primaryKey() {
        return 'OGUID'
    }
    static get incrementing() {
        return false
    }
}

module.exports = BatchOpt
