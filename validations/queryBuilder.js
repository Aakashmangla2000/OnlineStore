const DB = require("../db")

const filter2 = (qb, { gt, lt, eq, bt }, columnName, flag = false) => {
    if (gt)
        qb.where(DB.raw(`${columnName}`), '>', flag ? new Date(gt) : gt);
    else if (lt)
        qb.where(DB.raw(`${columnName}`), '<', flag ? new Date(lt) : lt);
    else if (eq)
        qb.where(DB.raw(`${columnName}`), '=', flag ? new Date(eq) : eq);
    else if (bt) {
        dts = bt.split(',').map(dt => new Date(dt))
        qb.whereBetween(DB.raw(`${columnName}`), [dts[0], dts[1]])
    }
}

const filter = ({ gte, lte, eq, bt }, columnName) => {
    if (gte)
        return {
            "range": {
                [columnName]: {
                    "gte": gte
                }
            }
        }
    else if (lte)
        return {
            "range": {
                [columnName]: {
                    "lte": lte
                }
            }
        }
    else if (eq)
        return {
            "match": {
                [columnName]: eq
            }
        }
    else if (bt) {
        dts = bt.split(',').map(dt => new Date(dt))
        return {
            "range": {
                [columnName]: {
                    "lte": dts[1],
                    "gte": dts[0]
                }
            }
        }
    }
}

module.exports = { filter }