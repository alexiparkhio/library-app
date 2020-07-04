require('dotenv').config();
const { env: { TEST_MONGODB_URL } } = process;
const { expect } = require('chai');
const { floor, random } = Math;
const { mongoose, models: { Admin, Member, Book } } = require('hexad-library-data');
const removeBook = require('./remove-book');
const bcrypt = require('bcryptjs');
const { errors: { NotFoundError } } = require('hexad-library-commons');

describe('removeBook', () => {
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
        it('should succeed on removing a book from the database if the profile is an admin', async () => {
            const [book, admin] = await Promise.all([
                Book.findOne({ ISBN }),
                Admin.findById(adminId)
            ]);

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

            expect(admin).to.exist;
            expect(admin).to.be.instanceof(Object);
            expect(admin.addedBooks).to.exist;
            expect(admin.addedBooks).to.be.instanceof(Array);
            expect(admin.addedBooks.length).to.equal(1);
            expect(admin.addedBooks[0].toString()).to.equal(book.id.toString());

            const result = await removeBook(adminId, ISBN);

            expect(result).to.be.undefined;

            const [_book, _admin] = await Promise.all([
                Book.findOne({ ISBN }),
                Admin.findById(adminId)
            ]);

            expect(_book).to.be.null;
            expect(_admin.addedBooks.length).to.equal(0);
        });

        it('should fail to update a book if the book does not exist', async () => {
            await Book.deleteMany();
            let _error;

            try {
                await removeBook(adminId, ISBN);
            } catch (error) {
                _error = error;
            }

            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotFoundError);
            expect(_error.message).to.equal(`book with ISBN ${ISBN} does not exist`);
        });

        it('should fail to update a book if the admin does not exist', async () => {
            await Admin.deleteMany();
            let _error;

            try {
                await removeBook(adminId, ISBN);
            } catch (error) {
                _error = error;
            }

            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotFoundError);
            expect(_error.message).to.equal(`admin with id ${adminId} does not exist`);
        });
    });

    describe('synchronous paths', () => {
        it('should fail on a non-string adminId', () => {
            adminId = random();
            expect(() => removeBook(adminId, ISBN)).to.throw(TypeError, `adminId ${adminId} is not a string`);

            adminId = undefined;
            expect(() => removeBook(adminId, ISBN)).to.throw(TypeError, `adminId ${adminId} is not a string`);

            adminId = false;
            expect(() => removeBook(adminId, ISBN)).to.throw(TypeError, `adminId ${adminId} is not a string`);

            adminId = [1, 2, 3];
            expect(() => removeBook(adminId, ISBN)).to.throw(TypeError, `adminId ${adminId} is not a string`);
        });

        it('should fail on a non-string ISBN', () => {
            adminId = `adminId-${random()}`;

            ISBN = random();
            expect(() => removeBook(adminId, ISBN)).to.throw(TypeError, `ISBN ${ISBN} is not a string`);

            ISBN = undefined;
            expect(() => removeBook(adminId, ISBN)).to.throw(TypeError, `ISBN ${ISBN} is not a string`);

            ISBN = false;
            expect(() => removeBook(adminId, ISBN)).to.throw(TypeError, `ISBN ${ISBN} is not a string`);

            ISBN = [1, 2, 3];
            expect(() => removeBook(adminId, ISBN)).to.throw(TypeError, `ISBN ${ISBN} is not a string`);
        });
    })

    afterEach(async () => await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]));

    after(async () => {
        await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]);
        await mongoose.disconnect();
    })
})