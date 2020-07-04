require('dotenv').config();
const { env: { TEST_MONGODB_URL } } = process;
const { expect } = require('chai');
const { floor, random } = Math;
const { mongoose, models: { Admin, Member, Book } } = require('hexad-library-data');
const addBooks = require('./add-books');
const bcrypt = require('bcryptjs');

describe('registerUser', () => {
    // User-oriented variables
    let email, password, encryptedPassword, role, match, adminId;

    // Book-oriented variables
    let title, description;

    before(async () => {
        await mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]);
    });

    beforeEach(async () => {
        email = `email-${random()}@gmail.com`;
        password = `password-${random()}`;
        role = 'ADMIN';
        encryptedPassword = await bcrypt.hash(password, 10);

        const admin = await Admin.create({ email, password: encryptedPassword, role, created: new Date() });
        userId = admin.id.toString();

        title = `title-${random()}`;
        description = `description-${random()}`;
    })

    afterEach(async () => await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]));

    after(async () => {
        await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]);
        await mongoose.disconnect();
    })
})