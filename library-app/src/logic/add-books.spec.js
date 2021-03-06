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
const addBooks = require('./add-books');
const { errors: { NotAllowedError, ContentError, NotFoundError } } = require('library-commons');
const bcrypt = require('bcryptjs');
const atob = require('atob');
const jwt = require('jsonwebtoken');
const context = require('./context');

context.API_URL = TEST_API_URL;
context.storage = {};

describe('addBooks', () => {
    // User-oriented variables
    let email, password, encryptedPassword, role, match, adminId;

    // Book-oriented variables
    let title, ISBN, description, author, yearOfPublication, stock;

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
        let token = jwt.sign({ sub: adminId }, SECRET, { expiresIn: EXPIRACY });
        context.storage.token = token;
        context.storage.role = role;

        title = `title-${random()}`;
        ISBN = `ISBN-${random()}`;
        description = `description-${random()}`;
        author = `author-${random()}`;
        yearOfPublication = 1900 + floor(random() * 120);
        stock = floor(random() * 99) + 1;
    })

    describe('asynchronous paths', () => {
        it('should succeed  to add new book stock to the library if the data is valid and the profile is an admin', async () => {
            const result = await addBooks({ title, ISBN, description, author, yearOfPublication, stock });

            expect(result).to.be.undefined;

            const [admin, book] = await Promise.all([Admin.findById(adminId), Book.findOne({ ISBN })]);

            expect(admin).to.exist;
            expect(admin.addedBooks).to.exist;
            expect(admin.addedBooks).to.be.instanceof(Array);
            expect(admin.addedBooks.length).to.equal(1);
            expect(admin.addedBooks[0].toString()).to.deep.equal(book.id);

            expect(book).to.exist;
            expect(book).to.be.instanceof(Object);
            expect(book.title).to.equal(title);
            expect(book.ISBN).to.equal(ISBN);
            expect(book.description).to.equal(description);
            expect(book.author).to.equal(author);
            expect(book.yearOfPublication).to.equal(yearOfPublication);
            expect(book.added).to.be.instanceof(Date);
            expect(book.stock).to.equal(stock);
            expect(book.status).to.equal('available');
        });

        it('should succeed on updating the books stock if the book was added on the database beforehand', async () => {
            let book = await Book.create({ title, ISBN, description, author, yearOfPublication, added: new Date(), stock });
            await Admin.findByIdAndUpdate(adminId, { $addToSet: { addedBooks: book.id } });

            const extraStock = floor(random() * 9999) + 1;

            const result = await addBooks({ title, ISBN, description, author, yearOfPublication, stock: extraStock });

            expect(result).to.be.undefined;

            book = await Book.findOne({ ISBN });

            expect(book).to.exist;
            expect(book).to.be.instanceof(Object);
            expect(book.title).to.equal(title);
            expect(book.ISBN).to.equal(ISBN);
            expect(book.description).to.equal(description);
            expect(book.author).to.equal(author);
            expect(book.yearOfPublication).to.equal(yearOfPublication);
            expect(book.added).to.be.instanceof(Date);
            expect(book.stock).to.equal(stock + extraStock);
            expect(book.status).to.equal('available');
        });

        it('should fail to add the book if a book with a certain idNumber exists but the title does not match with the one provided', async () => {
            await addBooks({ title, ISBN, description, author, yearOfPublication, stock });
            let _error;

            try {
                await addBooks({ title: `${title}-wrong`, ISBN, description, author, yearOfPublication, stock });
            } catch (error) {
                _error = error;
            }

            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotAllowedError);
            expect(_error.message).to.equal(`book with title ${title}-wrong has a different ISBN`)
        })

        it('should fail to add books if the admin trying to add them does not exist', async () => {
            await Admin.deleteMany();

            let _error;

            try {
                await addBooks({ title, ISBN, description, author, yearOfPublication, stock });
            } catch (error) {
                _error = error;
            }

            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotFoundError);
            expect(_error.message).to.equal(`admin with id ${adminId} does not exist`);
        });
    });

    describe('synchronous paths', () => {
        let bookData = { title, ISBN, description, author, yearOfPublication };

        it('should fail on a non-object bookData', () => {
            bookData = random();
            expect(() => addBooks(bookData)).to.throw(TypeError, `bookData ${bookData} is not a Object`);

            bookData = undefined;
            expect(() => addBooks(bookData)).to.throw(TypeError, `bookData ${bookData} is not a Object`);

            bookData = false;
            expect(() => addBooks(bookData)).to.throw(TypeError, `bookData ${bookData} is not a Object`);

            bookData = 'string';
            expect(() => addBooks(bookData)).to.throw(TypeError, `bookData ${bookData} is not a Object`);
        })

        it('should fail on a non-string title', () => {
            bookData = {};

            bookData.title = random();
            expect(() => addBooks(bookData)).to.throw(TypeError, `title ${bookData.title} is not a string`);

            bookData.title = undefined;
            expect(() => addBooks(bookData)).to.throw(TypeError, `title ${bookData.title} is not a string`);

            bookData.title = false;
            expect(() => addBooks(bookData)).to.throw(TypeError, `title ${bookData.title} is not a string`);

            bookData.title = [1, 2, 3];
            expect(() => addBooks(bookData)).to.throw(TypeError, `title ${bookData.title} is not a string`);
        });

        it('should fail on a non-string ISBN', () => {
            bookData.title = `title-${random()}`;

            bookData.ISBN = random();
            expect(() => addBooks(bookData)).to.throw(TypeError, `ISBN ${bookData.ISBN} is not a string`);

            bookData.ISBN = undefined;
            expect(() => addBooks(bookData)).to.throw(TypeError, `ISBN ${bookData.ISBN} is not a string`);

            bookData.ISBN = false;
            expect(() => addBooks(bookData)).to.throw(TypeError, `ISBN ${bookData.ISBN} is not a string`);

            bookData.ISBN = [1, 2, 3];
            expect(() => addBooks(bookData)).to.throw(TypeError, `ISBN ${bookData.ISBN} is not a string`);
        });
        
        it('should fail on a non-number stock', () => {
            bookData.ISBN = `ISBN-${random()}`;

            bookData.stock = 'sdfkjn';
            expect(() => addBooks(bookData)).to.throw(TypeError, `stock ${bookData.stock} is not a number`);

            bookData.stock = undefined;
            expect(() => addBooks(bookData)).to.throw(TypeError, `stock ${bookData.stock} is not a number`);

            bookData.stock = false;
            expect(() => addBooks(bookData)).to.throw(TypeError, `stock ${bookData.stock} is not a number`);

            bookData.stock = [1, 2, 3];
            expect(() => addBooks(bookData)).to.throw(TypeError, `stock ${bookData.stock} is not a number`);
        });

        it('should fail on a non-string description, if provided', () => {
            bookData.stock = floor(random() * 999) + 1;
            
            bookData.description = random();
            expect(() => addBooks(bookData)).to.throw(TypeError, `description ${bookData.description} is not a string`);

            bookData.description = undefined;
            expect(() => addBooks(bookData)).not.to.throw();

            bookData.description = false;
            expect(() => addBooks(bookData)).to.throw(TypeError, `description ${bookData.description} is not a string`);
        });

        it('should fail on a non-string author, if provided', () => {
            bookData.description = `description-${random()}`;

            bookData.author = random();
            expect(() => addBooks(bookData)).to.throw(TypeError, `author ${bookData.author} is not a string`);

            bookData.author = undefined;
            expect(() => addBooks(bookData)).not.to.throw();

            bookData.author = false;
            expect(() => addBooks(bookData)).to.throw(TypeError, `author ${bookData.author} is not a string`);
        });

        it('should fail on a non-number yearOfPublication, if provided', () => {
            bookData.author = `author-${random()}`;

            bookData.yearOfPublication = 'string';
            expect(() => addBooks(bookData)).to.throw(TypeError, `yearOfPublication ${bookData.yearOfPublication} is not a number`);

            bookData.yearOfPublication = undefined;
            expect(() => addBooks(bookData)).not.to.throw();

            bookData.yearOfPublication = false;
            expect(() => addBooks(bookData)).to.throw(TypeError, `yearOfPublication ${bookData.yearOfPublication} is not a number`);
        });
    })

    afterEach(async () => await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]));

    after(async () => {
        await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]);
        await mongoose.disconnect();
    })
})