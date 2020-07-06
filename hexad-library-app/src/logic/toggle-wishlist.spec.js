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
const toggleWishlist = require('./toggle-wishlist');
const { errors: { NotAllowedError, ContentError, NotFoundError } } = require('hexad-library-commons');
const bcrypt = require('bcryptjs');
const atob = require('atob');
const jwt = require('jsonwebtoken');
const context = require('./context');

context.API_URL = TEST_API_URL;
context.storage = {};

describe('toggleWishlist', () => {
    // Admin-oriented variables
    let adminEmail, adminPassword, adminEncryptedPassword, adminRole, adminId;

    // Member-oriented variables
    let memberEmail, memberPassword, memberEncryptedPassword, memberRole, memberId;

    // Book-oriented variables
    let title, ISBN, description, author, yearOfPublication, stock;

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
        let token = jwt.sign({ sub: memberId }, SECRET, { expiresIn: EXPIRACY });
        context.storage.token = token;
        context.storage.role = memberRole;

        title = `title-${random()}`;
        ISBN = `ISBN-${random()}`;
        description = `description-${random()}`;
        author = `author-${random()}`;
        yearOfPublication = 1900 + floor(random() * 120);
        stock = floor(random() * 99) + 1;

        const book = await Book.create({ title, author, description, ISBN, yearOfPublication, stock, status: 'available', added: new Date() });
        bookId = book.id.toString();
        await Admin.findByIdAndUpdate(adminId, { $addToSet: { addedBooks: bookId } });
    });

    describe('asynchronous paths', () => {
        it('should succeed on adding to members wishlist the specified book', async () => {
            const result = await toggleWishlist(ISBN);

            expect(result).to.be.undefined;

            const member = await Member.findById(memberId);
            expect(member).to.exist;
            expect(member.wishlistedBooks).to.exist;
            expect(member.wishlistedBooks).to.be.instanceof(Array);
            expect(member.wishlistedBooks.length).to.equal(1);
            expect(member.wishlistedBooks[0].toString()).to.deep.equal(bookId);
        });

        it('should successfully unwishlist a book if the book was already on the wishlistedBooks array', async () => {
            await toggleWishlist(ISBN);

            const result = await toggleWishlist(ISBN);

            expect(result).to.be.undefined;

            const member = await Member.findById(memberId);
            expect(member.wishlistedBooks).to.exist;
            expect(member.wishlistedBooks).to.be.instanceof(Array);
            expect(member.wishlistedBooks.length).to.equal(0);
        });

        it('should fail to borrow a book if the book does not exist', async () => {
            await Book.deleteMany();
            let _error;

            try {
                await toggleWishlist(ISBN);
            } catch (error) {
                _error = error;
            }

            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotFoundError);
            expect(_error.message).to.equal(`book with ISBN ${ISBN} does not exist`);
        });

        it('should fail to borrow a book if the member does not exist', async () => {
            await Member.deleteMany();
            let _error;

            try {
                await toggleWishlist(ISBN);
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
            memberId = `memberId-${random()}`

            ISBN = random();
            expect(() => toggleWishlist(ISBN)).to.throw(TypeError, `ISBN ${ISBN} is not a string`);

            ISBN = undefined;
            expect(() => toggleWishlist(ISBN)).to.throw(TypeError, `ISBN ${ISBN} is not a string`);

            ISBN = false;
            expect(() => toggleWishlist(ISBN)).to.throw(TypeError, `ISBN ${ISBN} is not a string`);

            ISBN = [1, 2, 3];
            expect(() => toggleWishlist(ISBN)).to.throw(TypeError, `ISBN ${ISBN} is not a string`);
        });
    })


    afterEach(async () => await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]));

    after(async () => {
        await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]);
        await mongoose.disconnect();
    })
})