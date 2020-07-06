require('dotenv').config();

const {
    REACT_APP_TEST_MONGODB_URL: TEST_MONGODB_URL,
    REACT_APP_TEST_API_URL: TEST_API_URL,
    REACT_APP_JWT_SECRET: SECRET,
    REACT_APP_JWT_EXPIRACY: EXPIRACY
} = process.env;
const { expect } = require('chai');
const { floor, random } = Math;
const { mongoose, models: { Admin, Member, Book } } = require('hexad-library-data');
const retrieveUser = require('./retrieve-user');
const { errors: { NotAllowedError, ContentError, NotFoundError } } = require('hexad-library-commons');
const bcrypt = require('bcryptjs');
const atob = require('atob');
const jwt = require('jsonwebtoken');
const context = require('./context');

context.API_URL = TEST_API_URL;
context.storage = {};

describe('retrieveUser', () => {
    // Admin-oriented variables
    let adminEmail, adminPassword, adminEncryptedPassword, adminRole, adminId;

    // Member-oriented variables
    let memberEmail, memberPassword, memberEncryptedPassword, memberRole, memberId;

    before(async () => {
        await mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]);
    });

    beforeEach(async () => {
        adminEmail = `adminEmail-${random()}@gmail.com`;
        adminPassword = `adminPassword-${random()}`;
        adminRole = 'ADMIN';
        adminEncryptedPassword = await bcrypt.hash(adminPassword, 10);

        const admin = await Admin.create({ email: adminEmail, password: adminEncryptedPassword, role: adminRole, created: new Date() });
        adminId = admin.id.toString();

        memberEmail = `memberEmail-${random()}@gmail.com`;
        memberPassword = `memberPassword-${random()}`;
        memberRole = 'MEMBER';
        memberEncryptedPassword = await bcrypt.hash(memberPassword, 10);

        const member = await Member.create({ email: memberEmail, password: memberEncryptedPassword, role: memberRole, created: new Date() });
        memberId = member.id.toString();
    })

    describe('asynchronous paths', () => {
        it('should succeed on retrieving an admin whose token was previously set', async () => {
            let token = jwt.sign({ sub: adminId }, SECRET, { expiresIn: EXPIRACY });
            context.storage.token = token;
            context.storage.role = adminRole;

            const admin = await retrieveUser();

            expect(admin).to.exist;
            expect(admin).to.be.instanceof(Object);
            expect(admin.email).to.equal(adminEmail);
            expect(admin.password).to.be.undefined;
            expect(admin.id).to.deep.equal(adminId);
            expect(admin.role).to.equal(adminRole);
            expect(admin._id).to.be.undefined;
            expect(admin.__v).to.be.undefined;
            expect(admin.addedBooks).to.exist;
            expect(admin.requests).to.exist;
            expect(admin.rentedBooks).to.exist;
        });

        it('should succeed on retrieving an admin whose token was previously set', async () => {
            let token = jwt.sign({ sub: memberId }, SECRET, { expiresIn: EXPIRACY });
            context.storage.token = token;
            context.storage.role = memberRole;

            const member = await retrieveUser();

            expect(member).to.exist;
            expect(member).to.be.instanceof(Object);
            expect(member.email).to.equal(memberEmail);
            expect(member.password).to.be.undefined;
            expect(member.id).to.deep.equal(memberId);
            expect(member.role).to.equal(memberRole);
            expect(member._id).to.be.undefined;
            expect(member.__v).to.be.undefined;
            expect(member.requestedBooks).to.exist;
            expect(member.borrowedBooks).to.exist;
        });

        it('should fail to retrieve an admin if the admin does not exist', async () => {
            let token = jwt.sign({ sub: adminId }, SECRET, { expiresIn: EXPIRACY });
            context.storage.token = token;
            context.storage.role = adminRole;
            
            await Admin.deleteMany();
            let _error;

            try {
                await retrieveUser();
            } catch (error) {
                _error = error;
            }

            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotFoundError);
            expect(_error.message).to.equal(`admin with id ${adminId} does not exist`);
        });

        it('should fail to retrieve a member if the member does not exist', async () => {
            let token = jwt.sign({ sub: memberId }, SECRET, { expiresIn: EXPIRACY });
            context.storage.token = token;
            context.storage.role = memberRole;

            await Member.deleteMany();
            let _error;

            try {
                await retrieveUser();
            } catch (error) {
                _error = error;
            }

            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotFoundError);
            expect(_error.message).to.equal(`member with id ${memberId} does not exist`);
        });
    });

    afterEach(async () => await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]));

    after(async () => {
        await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]);
        await mongoose.disconnect();
    })
})