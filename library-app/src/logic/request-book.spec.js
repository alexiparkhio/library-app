require('dotenv').config();

const {
    REACT_APP_TEST_MONGODB_URL: TEST_MONGODB_URL,
    REACT_APP_TEST_API_URL: TEST_API_URL,
    REACT_APP_JWT_SECRET: SECRET,
    REACT_APP_JWT_EXPIRACY: EXPIRACY
} = process.env;
const { expect } = require('chai');
const { floor, random } = Math;
const { mongoose, models: { Admin, Member, Book } } = require('library-data');
const requestBook = require('./request-book');
const { errors: { NotAllowedError, ContentError, NotFoundError } } = require('library-commons');
const bcrypt = require('bcryptjs');
const atob = require('atob');
const jwt = require('jsonwebtoken');
const context = require('./context');

context.API_URL = TEST_API_URL;
context.storage = {};

describe('requestBook', () => {
    // User-oriented variables
    let email, password, encryptedPassword, role, memberId;

    // Book-oriented variables
    let ISBN;

    before(async () => {
        await mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]);
    });

    beforeEach(async () => {
        email = `email-${random()}@gmail.com`;
        password = `password-${random()}`;
        role = 'MEMBER';
        encryptedPassword = await bcrypt.hash(password, 10);

        const member = await Member.create({ email, password: encryptedPassword, role, created: new Date() });
        memberId = member.id.toString();
        let token = jwt.sign({ sub: memberId }, SECRET, { expiresIn: EXPIRACY });
        context.storage.token = token;
        context.storage.role = role;

        ISBN = `ISBN-${random()}`;
    });

    describe('asynchronous paths', () => {
        it('should succeed on creating a new request with a valid member user', async () => {
            const result = await requestBook(ISBN);

            expect(result).to.be.undefined;

            const member = await Member.findById(memberId);

            expect(member).to.exist;
            expect(member).to.be.instanceof(Object);
            expect(member.requestedBooks).to.exist;
            expect(member.requestedBooks).to.be.instanceof(Array);
            expect(member.requestedBooks.length).to.equal(1);

            const [request] = member.requestedBooks;
            expect(request).to.be.instanceof(Object);
            expect(request.requester.toString()).to.equal(memberId);
            expect(request.ISBN).to.equal(ISBN);
        });

        it('should appear on every admin profile on a successful request', async () => {
            let admin, adminId;
            admin = await Admin.create({ email, password: encryptedPassword, role: 'ADMIN', created: new Date() });
            adminId = admin.id.toString();

            const result = await requestBook(ISBN);

            expect(result).to.be.undefined;

            admin = await Admin.findById(adminId);
            expect(admin).to.exist;
            expect(admin).to.be.instanceOf(Object);
            expect(admin.requests).to.exist;
            expect(admin.requests).to.be.instanceof(Array);
            expect(admin.requests.length).to.equal(1);

            const [request] = admin.requests;
            expect(request).to.be.instanceof(Object);
            expect(request.requester.toString()).to.equal(memberId);
            expect(request.ISBN).to.equal(ISBN);
        });

        it('should fail to request the book if the book was already requested by the member', async () => {
            await requestBook(ISBN);
            let _error;

            try {
                await requestBook(ISBN);
            } catch (error) {
                _error = error;
            }

            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotAllowedError);
            expect(_error.message).to.equal(`book with ISBN ${ISBN} was already requested by member with id ${memberId}`);
        });

        it('should fail to request the book if the member does not exist', async () => {
            await Member.deleteMany();
            let _error;

            try {
                await requestBook(ISBN);
            } catch (error) {
                _error = error;
            }

            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotFoundError);
            expect(_error.message).to.equal(`member with id ${memberId} does not exist`);
        });
    });

    describe('synchronous paths', () => {
        it('should fail on a non-string ISBN', () => {

            ISBN = random();
            expect(() => requestBook(ISBN)).to.throw(TypeError, `ISBN ${ISBN} is not a string`);

            ISBN = undefined;
            expect(() => requestBook(ISBN)).to.throw(TypeError, `ISBN ${ISBN} is not a string`);

            ISBN = false;
            expect(() => requestBook(ISBN)).to.throw(TypeError, `ISBN ${ISBN} is not a string`);

            ISBN = [1, 2, 3];
            expect(() => requestBook(ISBN)).to.throw(TypeError, `ISBN ${ISBN} is not a string`);
        });
    })

    afterEach(async () => await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]));

    after(async () => {
        await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]);
        await mongoose.disconnect();
    })
})