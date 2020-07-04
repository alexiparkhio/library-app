require('dotenv').config();
const { env: { TEST_MONGODB_URL } } = process;
const { expect } = require('chai');
const { floor, random } = Math;
const { mongoose, models: { Admin, Member, Book } } = require('hexad-library-data');
const authenticateUser = require('./authenticate-user');
const bcrypt = require('bcryptjs');
const { NotAllowedError, NotFoundError, ContentError } = require('hexad-library-commons/errors');

describe('registerUser', () => {
    // Admin-oriented variables
    let adminEmail, adminPassword, adminEncryptedPassword, adminRole, adminId;

    // Member-oriented variables
    let memberEmail, memberPassword, memberEncryptedPassword, memberRole, memberId;

    // Synchronous-oriented variables
    let email, password, role;

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

        email = `email-${random()}@gmail.com`;
        password = `password-${random()}`;
        role = `role-${random()}`;
    })

    describe('asynchronous paths', () => {
        it('should succeed on authenticate an admin on correct credentials, and return its id', async () => {
            const result = await authenticateUser(adminEmail, adminPassword, adminRole);

            expect(result).to.exist;
            expect(result).to.be.a('string');
            expect(result).to.equal(adminId);

            const admin = await Admin.findOne({ email: adminEmail });
            expect(admin.authenticated).to.be.instanceof(Date);
        });

        it('should succeed on authenticate a member on correct credentials, and return its id', async () => {
            const result = await authenticateUser(memberEmail, memberPassword, memberRole);

            expect(result).to.exist;
            expect(result).to.be.a('string');
            expect(result).to.equal(memberId);

            const member = await Member.findOne({ email: memberEmail });
            expect(member.authenticated).to.be.instanceof(Date);
        });

        it('should fail to authenticate the admin if the credentials are wrong', async () => {
            let _error;

            try {
                await authenticateUser(adminEmail, `${adminPassword}-wrong`, adminRole);
            } catch (error) {
                _error = error;
            }

            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotAllowedError);
            expect(_error.message).to.equal('wrong credentials');
        });

        it('should fail to authenticate the member if the credentials are wrong', async () => {
            let _error;

            try {
                await authenticateUser(memberEmail, `${memberPassword}-wrong`, memberRole);
            } catch (error) {
                _error = error;
            }

            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotAllowedError);
            expect(_error.message).to.equal('wrong credentials');
        });

        it('should fail to authenticate the admin if the admin does not exist', async () => {
            await Admin.deleteMany();

            let _error;

            try {
                await authenticateUser(adminEmail, adminPassword, adminRole);
            } catch (error) {
                _error = error;
            }

            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotFoundError);
            expect(_error.message).to.equal(`admin with email ${adminEmail} does not exist`);
        });

        it('should fail to authenticate the member if the member does not exist', async () => {
            await Member.deleteMany();

            let _error;

            try {
                await authenticateUser(memberEmail, memberPassword, memberRole);
            } catch (error) {
                _error = error;
            }

            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotFoundError);
            expect(_error.message).to.equal(`member with email ${memberEmail} does not exist`);
        });
    });

    describe('synchronous paths', () => {
        it('should fail on a non-string email', () => {
            email = random();
            expect(() => authenticateUser(email, password, role)).to.throw(TypeError, `email ${email} is not a string`);

            email = undefined;
            expect(() => authenticateUser(email, password, role)).to.throw(TypeError, `email ${email} is not a string`);
            email = false;
            expect(() => authenticateUser(email, password, role)).to.throw(TypeError, `email ${email} is not a string`);
            email = [1, 2, 3];
            expect(() => authenticateUser(email, password, role)).to.throw(TypeError, `email ${email} is not a string`);
        });

        it('should fail on a badly-formatted email', () => {
            email = 'i7u23598';
            expect(() => authenticateUser(email, password, role)).to.throw(ContentError, `${email} is not an e-mail`);

            email = 'i7u23598@';
            expect(() => authenticateUser(email, password, role)).to.throw(ContentError, `${email} is not an e-mail`);

            email = 'i7u23598@fdsg';
            expect(() => authenticateUser(email, password, role)).to.throw(ContentError, `${email} is not an e-mail`);
        });

        it('should fail on a non-string password', () => {
            email = `email-${random()}@gmail.com`;

            password = random();
            expect(() => authenticateUser(email, password, role)).to.throw(TypeError, `password ${password} is not a string`);

            password = undefined;
            expect(() => authenticateUser(email, password, role)).to.throw(TypeError, `password ${password} is not a string`);

            password = false;
            expect(() => authenticateUser(email, password, role)).to.throw(TypeError, `password ${password} is not a string`);

            password = [1, 2, 3];
            expect(() => authenticateUser(email, password, role)).to.throw(TypeError, `password ${password} is not a string`);
        });

        it('should fail on a non-string role', () => {
            password = `password-${random()}`;

            role = random();
            expect(() => authenticateUser(email, password, role)).to.throw(TypeError, `role ${role} is not a string`);

            role = undefined;
            expect(() => authenticateUser(email, password, role)).to.throw(TypeError, `role ${role} is not a string`);

            role = false;
            expect(() => authenticateUser(email, password, role)).to.throw(TypeError, `role ${role} is not a string`);

            role = [1, 2, 3];
            expect(() => authenticateUser(email, password, role)).to.throw(TypeError, `role ${role} is not a string`);
        });
    })

    afterEach(async () => await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]));

    after(async () => {
        await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]);
        await mongoose.disconnect();
    })
})