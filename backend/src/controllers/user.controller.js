const userService = require('../services/user.service');

const create = async (req, res, next) => {
    try {
        const user = await userService.createUser(req.body, req.user.id);
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

const remove = async (req, res, next) => {
    try {
        await userService.deleteUser(req.params.id);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { create, list, remove };
