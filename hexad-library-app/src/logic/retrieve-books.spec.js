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
const retrieveBooks = require('./retrieve-books');
const { errors: { NotAllowedError, ContentError, NotFoundError } } = require('hexad-library-commons');
const bcrypt = require('bcryptjs');
const atob = require('atob');
const jwt = require('jsonwebtoken');
const context = require('./context');

context.API_URL = TEST_API_URL;
context.storage = {};

describe('retrieveBooks', () => {
    // User-oriented variables
    let email, password, encryptedPassword, adminId;

    // Book-oriented variables
    let title, description, stock, author, ISBN, yearOfPublication;

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
        adminId = admin.id.toString();

        for (let i = 0; i < 10; i++) {
            title = `title-${i}`;
            description = `description-${i}`;
            author = `author-${i}`;
            yearOfPublication = i;
            ISBN = i;
            stock = i;

            const book = await Book.create({ title, description, author, yearOfPublication, ISBN, stock, added: new Date() });

            await Admin.findByIdAndUpdate(adminId, { $addToSet: { addedBooks: book.id } });
        };
    })

    describe('asychronous paths', () => {

        it('should succeed on retrieving all available books in an array', async () => {
            const books = await retrieveBooks();

            expect(books).to.exist;
            expect(books).to.be.instanceof(Array);
            expect(books.length).to.equal(10);

            books.forEach((book, index) => {
                expect(book).to.be.instanceof(Object);
                expect(book.title).to.equal(`title-${index}`);
                expect(book.description).to.equal(`description-${index}`);
                expect(book.author).to.equal(`author-${index}`);
                expect(book.ISBN).to.equal(index.toString());
                expect(book.yearOfPublication).to.equal(index);
                expect(book.stock).to.equal(index);
                expect(book._id).to.be.undefined;
                expect(book.__v).to.be.undefined;
            })
        });

        it('should successfully retrieve an empty array if no books are there to display', async () => {
            await Book.deleteMany();

            const books = await retrieveBooks();

            expect(books).to.exist;
            expect(books).to.be.instanceof(Array);
            expect(books.length).to.equal(0);
        })
    })

    afterEach(async () => await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]));

    after(async () => {
        await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]);
        await mongoose.disconnect();
    })
})