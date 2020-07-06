require('dotenv').config();
const { env: { TEST_MONGODB_URL } } = process;
const { expect } = require('chai');
const { floor, random } = Math;
const { mongoose, models: { Admin, Member, Book } } = require('hexad-library-data');
const registerUser = require('./register-user');
const { errors: { NotAllowedError, ContentError } } = require('hexad-library-commons');
const bcrypt = require('bcryptjs');

describe('registerUser', () => {
    let email, password, role, match;

    before(async () => {
        await mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]);
    });

    beforeEach(() => {
        email = `email-${random()}@gmail.com`;
        password = `password-${random()}`;
    })

    describe('asynchronous paths', () => {
        it('should succeed to register a new admin if the data is valid and the role is set to ADMIN', async () => {
            role = 'ADMIN';
            const result = await registerUser(email, password, role);

            expect(result).to.be.undefined;

            const admin = await Admin.findOne({ email, role });

            expect(admin).to.exist;
            expect(admin).to.be.instanceof(Object);
            expect(admin.email).to.equal(email);
            expect(admin.role).to.equal(role);
            expect(admin.password).not.to.equal(password);
            expect(admin.created).to.be.instanceof(Date);

            match = await bcrypt.compare(password, admin.password);
            expect(match).to.be.true;

            expect(admin.addedBooks).to.exist;
            expect(admin.addedBooks).to.be.instanceof(Array);

            expect(admin.requests).to.exist;
            expect(admin.requests).to.be.instanceof(Array);

            expect(admin.rentedBooks).to.exist;
            expect(admin.rentedBooks).to.be.instanceof(Array);
        });

        it('should succeed to register a new member if the data is valid and the role is set to MEMBER', async () => {
            role = 'MEMBER';

            const result = await registerUser(email, password, role);

            expect(result).to.be.undefined;

            const member = await Member.findOne({ email, role });

            expect(member).to.exist;
            expect(member).to.be.instanceof(Object);
            expect(member.email).to.equal(email);
            expect(member.role).to.equal(role);
            expect(member.password).not.to.equal(password);
            expect(member.created).to.be.instanceof(Date);

            match = await bcrypt.compare(password, member.password);
            expect(match).to.be.true;

            expect(member.requestedBooks).to.exist;
            expect(member.requestedBooks).to.be.instanceof(Array);

            expect(member.borrowedBooks).to.exist;
            expect(member.borrowedBooks).to.be.instanceof(Array);
        });

        it('should fail to register a new admin if an admin with the same email already exists on the database', async () => {
            role = 'ADMIN';
            password = await bcrypt.hash(password, 10);
            await Admin.create({ email, password, role, created: new Date() });

            let _error;

            try {
                await registerUser(email, password, role);
            } catch (error) {
                _error = error;
            }

            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotAllowedError);
            expect(_error.message).to.equal(`an admin with email ${email} already exists`);
        });

        it('should fail to register a new member if member with the same email already exists on the database', async () => {
            role = 'MEMBER';
            password = await bcrypt.hash(password, 10);
            await Member.create({ email, password, role, created: new Date() });

            let _error;

            try {
                await registerUser(email, password, role);
            } catch (error) {
                _error = error;
            }

            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotAllowedError);
            expect(_error.message).to.equal(`a member with email ${email} already exists`);
        });
    });

    describe('sychronous paths', () => {
        it('should fail on a non-string email', () => {
            email = random();
            expect(() => registerUser(email, password, role)).to.throw(TypeError, `email ${email} is not a string`);

            email = undefined;
            expect(() => registerUser(email, password, role)).to.throw(TypeError, `email ${email} is not a string`);
            email = false;
            expect(() => registerUser(email, password, role)).to.throw(TypeError, `email ${email} is not a string`);
            email = [1, 2, 3];
            expect(() => registerUser(email, password, role)).to.throw(TypeError, `email ${email} is not a string`);
        });

        it('should fail on a badly-formatted email', () => {
            email = 'i7u23598';
            expect(() => registerUser(email, password, role)).to.throw(ContentError, `${email} is not an e-mail`);
            
            email = 'i7u23598@';
            expect(() => registerUser(email, password, role)).to.throw(ContentError, `${email} is not an e-mail`);

            email = 'i7u23598@fdsg';
            expect(() => registerUser(email, password, role)).to.throw(ContentError, `${email} is not an e-mail`);
        })

        it('should fail on a non-string password', () => {
            email = `email-${random()}@gmail.com`;

            password = random();
            expect(() => registerUser(email, password, role)).to.throw(TypeError, `password ${password} is not a string`);

            password = undefined;
            expect(() => registerUser(email, password, role)).to.throw(TypeError, `password ${password} is not a string`);

            password = false;
            expect(() => registerUser(email, password, role)).to.throw(TypeError, `password ${password} is not a string`);

            password = [1, 2, 3];
            expect(() => registerUser(email, password, role)).to.throw(TypeError, `password ${password} is not a string`);
        });

        it('should fail on a non-string role', () => {
            password = `password-${random()}`;

            role = random();
            expect(() => registerUser(email, password, role)).to.throw(TypeError, `role ${role} is not a string`);

            role = undefined;
            expect(() => registerUser(email, password, role)).to.throw(TypeError, `role ${role} is not a string`);

            role = false;
            expect(() => registerUser(email, password, role)).to.throw(TypeError, `role ${role} is not a string`);
            
            role = [1, 2, 3];
            expect(() => registerUser(email, password, role)).to.throw(TypeError, `role ${role} is not a string`);
        });
    })

    afterEach(async () => await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]));

    after(async () => {
        await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]);
        await mongoose.disconnect();
    })
})