require('dotenv').config();
const { env: { TEST_MONGODB_URL } } = process;
const { expect } = require('chai');
const { floor, random, max } = Math;
const { mongoose, models: { Admin, Member, Book } } = require('hexad-library-data');
const borrowBook = require('./borrow-book');
const bcrypt = require('bcryptjs');
const { NotAllowedError, NotFoundError } = require('hexad-library-commons/errors');

describe('borrowBook', () => {
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
        it('should succeed on borrowing an available book and create an expiracy time to return it', async () => {
            const result = await borrowBook(memberId, ISBN);

            expect(result).to.be.undefined;

            const [member, book, admin] = await Promise.all([
                Member.findById(memberId),
                Book.findOne({ ISBN }),
                Admin.findById(adminId)
            ]);

            expect(member).to.exist;
            expect(member.borrowedBooks).to.exist;
            expect(member.borrowedBooks).to.be.instanceof(Array);
            expect(member.borrowedBooks.length).to.equal(1);
            expect(member.borrowedBooks[0]).to.be.instanceof(Object);
            expect(member.borrowedBooks[0].bookId.toString()).to.deep.equal(book.id.toString());
            expect(member.borrowedBooks[0].expiracyDate).to.exist;
            expect(member.borrowedBooks[0].expiracyDate).to.be.instanceof(Date);
            expect(member.borrowedBooks[0].daysCount).to.exist;
            expect(member.borrowedBooks[0].daysCount).to.equal(max(0.7 - member.overdueDays));

            expect(book).to.exist;
            expect(book.stock).to.equal(stock - 1);

            expect(admin).to.exist;
            expect(admin.rentedBooks).to.exist;
            expect(admin.rentedBooks).to.be.instanceof(Array);
            expect(admin.rentedBooks.length).to.equal(1);
            expect(admin.rentedBooks[0]).to.be.instanceof(Object);
            expect(admin.rentedBooks[0].memberId.toString()).to.deep.equal(memberId);
            expect(admin.rentedBooks[0].bookId.toString()).to.deep.equal(book.id);
            expect(admin.rentedBooks[0].expiracyDate).to.exist;
            expect(admin.rentedBooks[0].expiracyDate).to.be.instanceof(Date);
            expect(admin.rentedBooks[0].expiracyDate).to.deep.equal(member.borrowedBooks[0].expiracyDate);
        });

        it('should fail to allow the book to be borrowed if no stock is available', async () => {
            await Book.findOneAndUpdate({ ISBN }, { $set: { stock: 0 } });
            let _error;

            try {
                await borrowBook(memberId, ISBN);
            } catch (error) {
                _error = error;
            }
            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotAllowedError);
            expect(_error.message).to.equal(`book with ISBN ${ISBN} is out of stock`);
        });

        it('should fail to allow the book to be borrowed if that member already borrowed the book', async () => {
            await borrowBook(memberId, ISBN);
            let _error;

            try {
                await borrowBook(memberId, ISBN);
            } catch (error) {
                _error = error;
            }
            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotAllowedError);
            expect(_error.message).to.equal(`book with ISBN ${ISBN} was already borrowed by member with id ${memberId}`);
        });

        it('should fail to allow the book to be borrowed if that member has 2 books borrowed already', async () => {
            for (let i = 0; i < 2; i++) {
                title = `title-${random()}`;
                ISBN = `ISBN-${random()}`;
                description = `description-${random()}`;
                author = `author-${random()}`;
                yearOfPublication = 1900 + floor(random() * 120);
                stock = floor(random() * 99) + 1;

                await Book.create({ title, author, description, ISBN, yearOfPublication, stock, status: 'available', added: new Date() });

                await borrowBook(memberId, ISBN);
            };
            let _error;

            try {
                await borrowBook(memberId, ISBN);
            } catch (error) {
                _error = error;
            }
            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotAllowedError);
            expect(_error.message).to.equal(`member with id ${memberId} already has the maximum amount of books borrowed`);
        });

        it('should fail to borrow a book if the book does not exist', async () => {
            await Book.deleteMany();
            let _error;

            try {
                await borrowBook(memberId, ISBN);
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
                await borrowBook(memberId, ISBN);
            } catch (error) {
                _error = error;
            }

            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotFoundError);
            expect(_error.message).to.equal(`member with id ${memberId} does not exist`);
        });
    });

    describe('synchronous paths', () => {
        it('should fail on a non-string memberId', () => {
            memberId = random();
            expect(() => borrowBook(memberId, ISBN)).to.throw(TypeError, `memberId ${memberId} is not a string`);

            memberId = undefined;
            expect(() => borrowBook(memberId, ISBN)).to.throw(TypeError, `memberId ${memberId} is not a string`);

            memberId = false;
            expect(() => borrowBook(memberId, ISBN)).to.throw(TypeError, `memberId ${memberId} is not a string`);

            memberId = [1, 2, 3];
            expect(() => borrowBook(memberId, ISBN)).to.throw(TypeError, `memberId ${memberId} is not a string`);
        });

        it('should fail on a non-string ISBN', () => {
            memberId = `memberId-${random()}`

            ISBN = random();
            expect(() => borrowBook(memberId, ISBN)).to.throw(TypeError, `ISBN ${ISBN} is not a string`);

            ISBN = undefined;
            expect(() => borrowBook(memberId, ISBN)).to.throw(TypeError, `ISBN ${ISBN} is not a string`);

            ISBN = false;
            expect(() => borrowBook(memberId, ISBN)).to.throw(TypeError, `ISBN ${ISBN} is not a string`);

            ISBN = [1, 2, 3];
            expect(() => borrowBook(memberId, ISBN)).to.throw(TypeError, `ISBN ${ISBN} is not a string`);
        });
    })

    afterEach(async () => await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]));

    after(async () => {
        await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]);
        await mongoose.disconnect();
    })
})