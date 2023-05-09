const DB = require("../db")

const filter = (qb, { gt, lt, eq, bt }, columnName, flag = false) => {
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

module.exports = { filter }