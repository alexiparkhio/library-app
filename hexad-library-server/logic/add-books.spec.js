require('dotenv').config();
const { env: { TEST_MONGODB_URL } } = process;
const { expect } = require('chai');
const { floor, random } = Math;
const { mongoose, models: { Admin, Member, Book } } = require('hexad-library-data');
const addBooks = require('./add-books');
const bcrypt = require('bcryptjs');
const { NotFoundError, NotAllowedError } = require('hexad-library-commons/errors');

describe('addBooks', () => {
    // User-oriented variables
    let email, password, encryptedPassword, role, match, adminId;

    // Book-oriented variables
    let title, idNumber, description, author, yearOfPublication, stock;

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

        title = `title-${random()}`;
        idNumber = floor(random() * 999999) + 1;
        description = `description-${random()}`;
        author = `author-${random()}`;
        yearOfPublication = 1900 + floor(random() * 120);
        stock = floor(random() * 99) + 1;
    })

    describe('asynchronous paths', () => {
        it('should succeed  to add new book stock to the library if the data is valid and the profile is an admin', async () => {
            const result = await addBooks(adminId, { title, idNumber, description, author, yearOfPublication }, stock);

            expect(result).to.be.undefined;

            const [admin, book] = await Promise.all([Admin.findById(adminId), Book.findOne({ idNumber })]);

            expect(admin).to.exist;
            expect(admin.addedBooks).to.exist;
            expect(admin.addedBooks).to.be.instanceof(Array);
            expect(admin.addedBooks.length).to.equal(1);
            expect(admin.addedBooks[0].toString()).to.deep.equal(book.id);

            expect(book).to.exist;
            expect(book).to.be.instanceof(Object);
            expect(book.title).to.equal(title);
            expect(book.idNumber).to.equal(idNumber);
            expect(book.description).to.equal(description);
            expect(book.author).to.equal(author);
            expect(book.yearOfPublication).to.equal(yearOfPublication);
            expect(book.added).to.be.instanceof(Date);
            expect(book.stock).to.equal(stock);
            expect(book.status).to.equal('available');
        });

        it('should succeed on updating the books stock if the book was added on the database beforehand', async () => {
            let book = await Book.create({ title, idNumber, description, author, yearOfPublication, added: new Date(), stock });
            await Admin.findByIdAndUpdate(adminId, { $addToSet: { addedBooks: book.id } });

            const extraStock = floor(random() * 9999) + 1;

            const result = await addBooks(adminId, { title, idNumber, description, author, yearOfPublication }, extraStock);

            expect(result).to.be.undefined;

            book = await Book.findOne({ idNumber });

            expect(book).to.exist;
            expect(book).to.be.instanceof(Object);
            expect(book.title).to.equal(title);
            expect(book.idNumber).to.equal(idNumber);
            expect(book.description).to.equal(description);
            expect(book.author).to.equal(author);
            expect(book.yearOfPublication).to.equal(yearOfPublication);
            expect(book.added).to.be.instanceof(Date);
            expect(book.stock).to.equal(stock + extraStock);
            expect(book.status).to.equal('available');
        });

        it('should fail to add the book if a book with a certain idNumber exists but the title does not match with the one provided', async () => {
            await addBooks(adminId, { title, idNumber, description, author, yearOfPublication }, stock);
            let _error;

            try {
                await addBooks(adminId, { title: `${title}-wrong`, idNumber, description, author, yearOfPublication }, stock);
            } catch (error) {
                _error = error;
            }

            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotAllowedError);
            expect(_error.message).to.equal(`book with title ${title}-wrong has a different idNumber`)
        })

        it('should fail to add books if the admin trying to add them does not exist', async () => {
            await Admin.deleteMany();

            let _error;

            try {
                await addBooks(adminId, { title, idNumber, description, author, yearOfPublication }, stock);
            } catch (error) {
                _error = error;
            }

            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotFoundError);
            expect(_error.message).to.equal(`admin with id ${adminId} does not exist`);
        });
    });

    describe('synchronous paths', () => {
        let bookData = { title, idNumber, description, author, yearOfPublication };

        it('should fail on a non-string adminId', () => {
            adminId = random();
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `adminId ${adminId} is not a string`);

            adminId = undefined;
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `adminId ${adminId} is not a string`);

            adminId = false;
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `adminId ${adminId} is not a string`);

            adminId = [1, 2, 3];
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `adminId ${adminId} is not a string`);
        });

        it('should fail on a non-object bookData', () => {
            adminId = `id-${random()}`;

            bookData = random();
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `bookData ${bookData} is not a Object`);

            bookData = undefined;
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `bookData ${bookData} is not a Object`);

            bookData = false;
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `bookData ${bookData} is not a Object`);

            bookData = 'string';
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `bookData ${bookData} is not a Object`);
        })

        it('should fail on a non-string title', () => {
            bookData = {};

            bookData.title = random();
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `title ${bookData.title} is not a string`);

            bookData.title = undefined;
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `title ${bookData.title} is not a string`);

            bookData.title = false;
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `title ${bookData.title} is not a string`);

            bookData.title = [1, 2, 3];
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `title ${bookData.title} is not a string`);
        });

        it('should fail on a non-number idNumber', () => {
            bookData.title = `title-${random()}`;

            bookData.idNumber = 'string';
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `idNumber ${bookData.idNumber} is not a number`);

            bookData.idNumber = undefined;
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `idNumber ${bookData.idNumber} is not a number`);

            bookData.idNumber = false;
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `idNumber ${bookData.idNumber} is not a number`);

            bookData.idNumber = [1, 2, 3];
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `idNumber ${bookData.idNumber} is not a number`);
        });

        it('should fail on a non-string description, if provided', () => {
            bookData.idNumber = random();

            bookData.description = random();
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `description ${bookData.description} is not a string`);

            bookData.description = undefined;
            expect(() => addBooks(adminId, bookData, stock)).not.to.throw();

            bookData.description = false;
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `description ${bookData.description} is not a string`);
        });

        it('should fail on a non-string author, if provided', () => {
            bookData.description = `description-${random()}`;

            bookData.author = random();
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `author ${bookData.author} is not a string`);

            bookData.author = undefined;
            expect(() => addBooks(adminId, bookData, stock)).not.to.throw();

            bookData.author = false;
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `author ${bookData.author} is not a string`);
        });

        it('should fail on a non-number yearOfPublication, if provided', () => {
            bookData.author = `author-${random()}`;

            bookData.yearOfPublication = 'string';
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `yearOfPublication ${bookData.yearOfPublication} is not a number`);

            bookData.yearOfPublication = undefined;
            expect(() => addBooks(adminId, bookData, stock)).not.to.throw();

            bookData.yearOfPublication = false;
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `yearOfPublication ${bookData.yearOfPublication} is not a number`);
        });

        it('should fail on a non-number stock', () => {
            bookData.yearOfPublication = random();

            stock = 'sdfkjn';
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `stock ${stock} is not a number`);

            stock = undefined;
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `stock ${stock} is not a number`);

            stock = false;
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `stock ${stock} is not a number`);

            stock = [1, 2, 3];
            expect(() => addBooks(adminId, bookData, stock)).to.throw(TypeError, `stock ${stock} is not a number`);
        });
    })

    afterEach(async () => await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]));

    after(async () => {
        await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]);
        await mongoose.disconnect();
    })
})