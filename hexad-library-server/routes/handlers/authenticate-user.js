const { env: { JWT_SECRET, JWT_EXPIRACY } } = process;
const { authenticateUser } = require('../../logic');
const { errorHandler } = require('../../helpers');
const jwt = require('jsonwebtoken');

module.exports = (req, res) => {
    const { body: { email, password, role } } = req;

    try {
        authenticateUser(email, password, role)
            .then((id) => {
                const token = jwt.sign({ sub: id }, JWT_SECRET, { expiresIn: JWT_EXPIRACY });
                res.status(200).json({ token });
            })
            .catch(error => errorHandler(error, res));
    } catch (error) {
        errorHandler(error, res);
    }
}