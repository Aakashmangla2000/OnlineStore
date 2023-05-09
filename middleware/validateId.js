module.exports = (req, res, next) => {
    const id = parseInt(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }
    next();
}