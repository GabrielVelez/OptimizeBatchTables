'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class OnlineParameterValueOpt extends Model {
    static get table() {
        return 'pxOptBatches.onlineParameterValueOpt'
    }

    static get createdAtColumn() {
        return null
    }
    static get updatedAtColumn() {
        return null
    }

    static get primaryKey() {
        return 'ROOTGUID'
    }
    static get incrementing() {
        return false
    }
}

module.exports = OnlineParameterValueOpt