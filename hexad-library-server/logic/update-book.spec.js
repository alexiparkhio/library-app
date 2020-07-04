require('dotenv').config();
const { env: { TEST_MONGODB_URL } } = process;
const { expect } = require('chai');
const { floor, random } = Math;
const { mongoose, models: { Admin, Member, Book } } = require('hexad-library-data');
const updateBook = require('./update-book');
const bcrypt = require('bcryptjs');
const { update } = require('hexad-library-data/models/book');
const { NotFoundError } = require('hexad-library-commons/errors');

describe('updateBook', () => {
    // Admin-oriented variables
    let adminEmail, adminPassword, adminEncryptedPassword, adminRole, adminId;

    // Member-oriented variables
    let memberEmail, memberPassword, memberEncryptedPassword, memberRole, memberId;

    // Book-oriented variables
    let title, ISBN, description, author, yearOfPublication, stock, status, bookId;
    let STATUS = ['available', 'unavailable'];

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

        title = `title-${random()}`;
        ISBN = `ISBN-${random()}`;
        description = `description-${random()}`;
        author = `author-${random()}`;
        yearOfPublication = 1900 + floor(random() * 120);
        stock = floor(random() * 99) + 1;

        const book = await Book.create({ title, author, description, ISBN, yearOfPublication, stock, status: 'available', added: new Date() });
        bookId = book.id.toString();
    });

    describe('asynchronous paths', () => {
        let updatedTitle, updatedDescription, updatedYearOfPublication, updatedStock, updatedAuthor, updatedStatus;

        it('should succeed on updating the book data if the admin and the book exist', async () => {
            updatedTitle = `updatedTitle-${random()}`;
            updatedDescription = `updatedDescription-${random()}`;
            updatedYearOfPublication = random() + 1;
            updatedAuthor = `updatedAuthor-${random()}`;
            updatedStock = random() + 1;
            updatedStatus = STATUS[floor(random() * STATUS.length)];

            const result = await updateBook(adminId, {
                title: updatedTitle,
                description: updatedDescription,
                author: updatedAuthor,
                status: updatedStatus,
                yearOfPublication: updatedYearOfPublication,
                stock: updatedStock,
                ISBN
            });

            expect(result).to.be.undefined;

            const book = await Book.findOne({ ISBN });

            expect(book).to.exist;
            expect(book).to.be.instanceof(Object);
            expect(book.title).to.equal(updatedTitle);
            expect(book.description).to.equal(updatedDescription);
            expect(book.author).to.equal(updatedAuthor);
            expect(book.yearOfPublication).to.equal(updatedYearOfPublication);
            expect(book.stock).to.equal(updatedStock);
            expect(book.status).to.equal(updatedStatus);
        });

        it('should fail to update a book if the book does not exist', async () => {
            await Book.deleteMany();
            let _error;

            try {
                await updateBook(adminId, {
                    title: updatedTitle,
                    description: updatedDescription,
                    author: updatedAuthor,
                    status: updatedStatus,
                    yearOfPublication: updatedYearOfPublication,
                    stock: updatedStock,
                    ISBN
                });
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
                await updateBook(adminId, {
                    title: updatedTitle,
                    description: updatedDescription,
                    author: updatedAuthor,
                    status: updatedStatus,
                    yearOfPublication: updatedYearOfPublication,
                    stock: updatedStock,
                    ISBN
                });
            } catch (error) {
                _error = error;
            }

            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotFoundError);
            expect(_error.message).to.equal(`admin with id ${adminId} does not exist`);
        });
    });

    describe('synchronous paths', () => {
        let bookData = { title, ISBN, description, author, yearOfPublication, stock, status };

        it('should fail on a non-string adminId', () => {
            adminId = random();
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `adminId ${adminId} is not a string`);

            adminId = undefined;
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `adminId ${adminId} is not a string`);

            adminId = false;
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `adminId ${adminId} is not a string`);

            adminId = [1, 2, 3];
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `adminId ${adminId} is not a string`);
        });

        it('should fail on a non-object bookData', () => {
            adminId = `id-${random()}`;

            bookData = random();
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `bookData ${bookData} is not a Object`);

            bookData = undefined;
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `bookData ${bookData} is not a Object`);

            bookData = false;
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `bookData ${bookData} is not a Object`);

            bookData = 'string';
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `bookData ${bookData} is not a Object`);
        })

        it('should fail on a non-string title', () => {
            bookData = {};

            bookData.title = random();
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `title ${bookData.title} is not a string`);

            bookData.title = undefined;
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `title ${bookData.title} is not a string`);

            bookData.title = false;
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `title ${bookData.title} is not a string`);

            bookData.title = [1, 2, 3];
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `title ${bookData.title} is not a string`);
        });

        it('should fail on a non-string ISBN', () => {
            bookData.title = `title-${random()}`;

            bookData.ISBN = random();
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `ISBN ${bookData.ISBN} is not a string`);

            bookData.ISBN = undefined;
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `ISBN ${bookData.ISBN} is not a string`);

            bookData.ISBN = false;
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `ISBN ${bookData.ISBN} is not a string`);

            bookData.ISBN = [1, 2, 3];
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `ISBN ${bookData.ISBN} is not a string`);
        });

        it('should fail on a non-number stock', () => {
            bookData.ISBN = ISBN;

            bookData.stock = 'string';
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `stock ${bookData.stock} is not a number`);

            bookData.stock = undefined;
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `stock ${bookData.stock} is not a number`);

            bookData.stock = false;
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `stock ${bookData.stock} is not a number`);

            bookData.stock = [1, 2, 3];
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `stock ${bookData.stock} is not a number`);
        });
        
        it('should fail on a non-string status', () => {
            bookData.stock = random();

            bookData.status = random();
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `status ${bookData.status} is not a string`);

            bookData.status = undefined;
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `status ${bookData.status} is not a string`);

            bookData.status = false;
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `status ${bookData.status} is not a string`);

            bookData.status = [1, 2, 3];
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `status ${bookData.status} is not a string`);
        });

        it('should fail on a non-string description, if provided', () => {
            bookData.status = STATUS[floor(random() * STATUS.length)];

            bookData.description = random();
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `description ${bookData.description} is not a string`);

            bookData.description = undefined;
            expect(() => updateBook(adminId, bookData)).not.to.throw();

            bookData.description = false;
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `description ${bookData.description} is not a string`);
        });

        it('should fail on a non-string author, if provided', () => {
            bookData.description = `description-${random()}`;

            bookData.author = random();
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `author ${bookData.author} is not a string`);

            bookData.author = undefined;
            expect(() => updateBook(adminId, bookData)).not.to.throw();

            bookData.author = false;
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `author ${bookData.author} is not a string`);
        });

        it('should fail on a non-number yearOfPublication, if provided', () => {
            bookData.author = `author-${random()}`;

            bookData.yearOfPublication = 'string';
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `yearOfPublication ${bookData.yearOfPublication} is not a number`);

            bookData.yearOfPublication = undefined;
            expect(() => updateBook(adminId, bookData)).not.to.throw();

            bookData.yearOfPublication = false;
            expect(() => updateBook(adminId, bookData)).to.throw(TypeError, `yearOfPublication ${bookData.yearOfPublication} is not a number`);
        });
    })

    afterEach(async () => await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]));

    after(async () => {
        await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]);
        await mongoose.disconnect();
    })
})