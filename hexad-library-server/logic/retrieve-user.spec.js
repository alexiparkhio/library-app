require('dotenv').config();
const { env: { TEST_MONGODB_URL } } = process;
const { expect } = require('chai');
const { floor, random } = Math;
const { mongoose, models: { Admin, Member, Book } } = require('hexad-library-data');
const retrieveUser = require('./retrieve-user');
const bcrypt = require('bcryptjs');
const { NotFoundError } = require('hexad-library-commons/errors');

describe('retrieveUser', () => {
    // Admin-oriented variables
    let adminEmail, adminPassword, adminEncryptedPassword, adminRole, adminId;

    // Member-oriented variables
    let memberEmail, memberPassword, memberEncryptedPassword, memberRole, memberId;

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
    })

    describe('asynchronous paths', () => {

        it('should succeed on retrieving the user (either admin or member) on a valid id', async () => {
            const [admin, member] = await Promise.all([retrieveUser(adminId, adminRole), retrieveUser(memberId, memberRole)]);

            expect(admin).to.exist;
            expect(admin).to.be.instanceof(Object);
            expect(admin.email).to.equal(adminEmail);
            expect(admin.password).to.be.undefined;
            expect(admin.id).to.deep.equal(adminId);
            expect(admin.role).to.equal(adminRole);
            expect(admin._id).to.be.undefined;
            expect(admin.__v).to.be.undefined;
            expect(admin.addedBooks).to.exist;
            expect(admin.requests).to.exist;
            expect(admin.rentedBooks).to.exist;

            expect(member).to.exist;
            expect(member).to.be.instanceof(Object);
            expect(member.email).to.equal(memberEmail);
            expect(member.password).to.be.undefined;
            expect(member.id).to.deep.equal(memberId);
            expect(member.role).to.equal(memberRole);
            expect(member._id).to.be.undefined;
            expect(member.__v).to.be.undefined;
            expect(member.requestedBooks).to.exist;
            expect(member.borrowedBooks).to.exist;
        });

        it('should fail to retrieve an admin if the admin does not exist', async () => {
            await Admin.deleteMany();
            let _error;

            try {
                await retrieveUser(adminId, adminRole);
            } catch (error) {
                _error = error;
            }

            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotFoundError);
            expect(_error.message).to.equal(`admin with id ${adminId} does not exist`);
        });

        it('should fail to retrieve a member if the member does not exist', async () => {
            await Member.deleteMany();
            let _error;

            try {
                await retrieveUser(memberId, memberRole);
            } catch (error) {
                _error = error;
            }

            expect(_error).to.exist;
            expect(_error).to.be.instanceof(NotFoundError);
            expect(_error.message).to.equal(`member with id ${memberId} does not exist`);
        });
    })

    describe('synchronous paths', () => {
        let id = `id-${random()}`, role = `role-${random()}`;

        it('should fail on a non-string id', () => {
            id = random();
            expect(() => retrieveUser(id, role)).to.throw(TypeError, `id ${id} is not a string`);

            id = undefined;
            expect(() => retrieveUser(id, role)).to.throw(TypeError, `id ${id} is not a string`);

            id = false;
            expect(() => retrieveUser(id, role)).to.throw(TypeError, `id ${id} is not a string`);

            id = [1, 2, 3];
            expect(() => retrieveUser(id, role)).to.throw(TypeError, `id ${id} is not a string`);
        });

        it('should fail on a non-string role', () => {
            id = `id-${random()}`;

            role = random();
            expect(() => retrieveUser(id, role)).to.throw(TypeError, `role ${role} is not a string`);

            role = undefined;
            expect(() => retrieveUser(id, role)).to.throw(TypeError, `role ${role} is not a string`);

            role = false;
            expect(() => retrieveUser(id, role)).to.throw(TypeError, `role ${role} is not a string`);

            role = [1, 2, 3];
            expect(() => retrieveUser(id, role)).to.throw(TypeError, `role ${role} is not a string`);
        });
    })

    afterEach(async () => await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]));

    after(async () => {
        await Promise.all([Admin.deleteMany(), Member.deleteMany(), Book.deleteMany()]);
        await mongoose.disconnect();
    })
})