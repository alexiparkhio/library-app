require('dotenv').config();
const { env: { TEST_MONGODB_URL } } = process;
const { expect } = require('chai');
const { floor, random, max } = Math;
const { mongoose, models: { Admin, Member, Book } } = require('library-data');
const returnBorrowedBook = require('./return-borrowed-book');
const bcrypt = require('bcryptjs');
const { errors: { NotAllowedError, NotFoundError } } = require('library-commons');

describe('returnBorrowedBook', () => {
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

        const daysCount = max(0.7 + 3 * member.borrowedBooks.length - member.overdueDays);
        const expiracyDate = new Date((new Date()).setDate((new Date()).getDate() + daysCount));
        const newStock = stock - 1;

        await Promise.all([
            Member.findByIdAndUpdate(memberId, { $addToSet: { borrowedBooks: { bookId: book.id, daysCount, expiracyDate } } }),
            Book.findOneAndUpdate({ ISBN }, { $set: { stock: newStock } }),
            Admin.findByIdAndUpdate(adminId, {
                $addToSet: {
                    rentedBooks: {
                        memberId, bookId: book.id, expiracyDate
                    }
                }
            })
        ]);
    });

    describe('asynchronous paths', () => {
        it('should succeed on returning the book that was borrowed and evaluate the potential overdue time penalty', async () => {
            const result = await returnBorrowedBook(memberId, ISBN);

            expect(result).to.be.undefined;

            const [member, book, admin] = await Promise.all([
                Member.findById(memberId),
                Book.findOne({ ISBN }),
                Admin.findById(adminId)
            ]);

            expect(member).to.exist;
            expect(member.borrowedBooks).to.exist;
            expect(member.borrowedBooks).to.be.instanceof(Array);
            expect(member.borrowedBooks.length).to.equal(0);
            expect(member.overdueDays).to.equal(0);

            expect(book).to.exist;
            expect(book.stock).to.equal(stock);
            expect(book.status).to.equal('available');

            expect(admin).to.exist;
            expect(admin.rentedBooks).to.exist;
            expect(admin.rentedBooks).to.be.instanceof(Array);
            expect(admin.rentedBooks.length).to.equal(0);
        });

        it('should fail to return the borrwed book is the book is not on the members borrowedBooks array', async () => {
            await Member.findByIdAndUpdate(memberId, { $pull: { borrowedBooks: { bookId } } });
            let _error;

            try {
                await returnBorrowedBook(memberId, ISBN);
            } catch (error) {
                _error = error;
            }
    
            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotFoundError);
            expect(_error.message).to.equal(`book with ISBN ${ISBN} was not found on the borrowed books from member with id ${memberId}`);
        });

        it('should fail to return the borrowed book if the book does not exist', async () => {
            await Book.deleteMany();
            let _error;

            try {
                await returnBorrowedBook(memberId, ISBN);
            } catch (error) {
                _error = error;
            }

            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotFoundError);
            expect(_error.message).to.equal(`book with ISBN ${ISBN} does not exist`);
        });

        it('should fail to return the borrowed book if the member does not exist', async () => {
            await Member.deleteMany();
            let _error;

            try {
                await returnBorrowedBook(memberId, ISBN);
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
            expect(() => returnBorrowedBook(memberId, ISBN)).to.throw(TypeError, `memberId ${memberId} is not a string`);

            memberId = undefined;
            expect(() => returnBorrowedBook(memberId, ISBN)).to.throw(TypeError, `memberId ${memberId} is not a string`);

            memberId = false;
            expect(() => returnBorrowedBook(memberId, ISBN)).to.throw(TypeError, `memberId ${memberId} is not a string`);

            memberId = [1, 2, 3];
            expect(() => returnBorrowedBook(memberId, ISBN)).to.throw(TypeError, `memberId ${memberId} is not a string`);
        });

        it('should fail on a non-string ISBN', () => {
            memberId = `memberId-${random()}`

            ISBN = random();
            expect(() => returnBorrowedBook(memberId, ISBN)).to.throw(TypeError, `ISBN ${ISBN} is not a string`);

            ISBN = undefined;
            expect(() => returnBorrowedBook(memberId, ISBN)).to.throw(TypeError, `ISBN ${ISBN} is not a string`);

            ISBN = false;
            expect(() => returnBorrowedBook(memberId, ISBN)).to.throw(TypeError, `ISBN ${ISBN} is not a string`);

            ISBN = [1, 2, 3];
            expect(() => returnBorrowedBook(memberId, ISBN)).to.throw(TypeError, `ISBN ${ISBN} is not a string`);
        });
    })

    afterEach(async () => await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]));

    after(async () => {
        await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]);
        await mongoose.disconnect();
    })
})