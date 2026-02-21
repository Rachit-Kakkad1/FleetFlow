const userService = require('../services/user.service');

const create = async (req, res, next) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

const list = async (_req, res, next) => {
    try {
        const users = await userService.listUsers();
        res.json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

module.exports = { create, list };
