const authService = require('../services/auth.service');

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const getMe = async (req, res, next) => {
    try {
        const user = await authService.getProfile(req.user.id);
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

module.exports = { login, getMe };
