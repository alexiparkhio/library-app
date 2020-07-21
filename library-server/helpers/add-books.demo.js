require('dotenv').config();

const { env: { MONGODB_URL } } = process;
const { mongoose, models: { Admin, Book, Member } } = require('library-data');
const { floor, random } = Math;
const bcrypt = require('bcryptjs');

const admin = { email: `admin@gmail.com`, password: undefined, role: 'ADMIN', created: new Date() };
const member = { email: `member@gmail.com`, password: undefined, role: 'MEMBER', created: new Date() };
const BOOKS = [
    {
        title: "1984",
        author: "George Orwell",
        yearOfPublication: 1948,
        description: "In George Orwell's 1984, Winston Smith wrestles with oppression in Oceania, a place where the Party scrutinizes human actions with ever-watchful Big Brother.",
        ISBN: "9788499890944",
        stock: floor(random() * 99) + 1
    },
    {
        title: "A Confederacy of Dunces",
        author: "John Kennedy Toole",
        yearOfPublication: 1980,
        description: "The plot of A Confederacy of Dunces is a knotted, tangled, ridiculous thing. Following it is like unraveling a giant ball of yarn wrapped around a very fat man with a moustache and a funny hat who keeps falling over. So have patience… and watch out for toppling medievalists.",
        ISBN: "9780241951590",
        stock: 0
    },
    {
        title: "Alice's Adventures in Wonderland",
        author: "Lewis Carroll",
        yearOfPublication: 1865,
        description: "Alice is sitting with her sister outdoors when she spies a White Rabbit with a pocket watch. Fascinated by the sight, she follows the rabbit down the hole. She falls for a long time, and finds herself in a long hallway full of doors. There is also a key on the table, which unlocks a tiny door; through this door, she spies a beautiful garden. She longs to get there, but the door is too small. Soon, she finds a drink with a note that asks her to drink it. There is later a cake with a note that tells her to eat; Alice uses both, but she cannot seem to get a handle on things, and is always either too large to get through the door or too small to reach the key.",
        ISBN: "9780786112142",
        stock: floor(random() * 99) + 1
    },
    {
        title: "Foundation",
        author: "Isaac Asimov",
        yearOfPublication: 1951,
        description: "Called forth to stand trial on Trantor for allegations of treason (for foreshadowing the decline of the Galactic Empire), Seldon explains that his science of psychohistory foresees many alternatives, all of which result in the Galactic Empire eventually falling. If humanity follows its current path, the Empire will fall and 30,000 years of turmoil will overcome humanity before a second Empire arises. However, an alternative path allows for the intervening years to be only one thousand, if Seldon is allowed to collect the most intelligent minds and create a compendium of all human knowledge, entitled Encyclopedia Galactica.",
        ISBN: "9780553900347",
        stock: floor(random() * 99) + 1
    },
    {
        title: "Brave New World",
        author: "Aldous Huxley",
        yearOfPublication: 1932,
        description: "The novel opens in the World State city of London in AF (After Ford) 632 (AD 2540 in the Gregorian calendar), where citizens are engineered through artificial wombs and childhood indoctrination programmes into predetermined classes (or castes) based on intelligence and labour. Lenina Crowne, a hatchery worker, is popular and sexually desirable, but Bernard Marx, a psychologist, is not. He is shorter in stature than the average member of his high caste, which gives him an inferiority complex. His work with sleep-learning allows him to understand, and disapprove of, his society's methods of keeping its citizens peaceful, which includes their constant consumption of a soothing, happiness-producing drug called soma.",
        ISBN: "9780060850524",
        stock: floor(random() * 99) + 1
    },
];

mongoose.connect(MONGODB_URL, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(async () => {
        await Promise.all([
            Admin.deleteMany(),
            Book.deleteMany(),
            Member.deleteMany()
        ]);

        member.password = await bcrypt.hash('123', 10);
        admin.password = await bcrypt.hash('123', 10);

        const _member = await Member.create(member);
        const _admin = await Admin.create(admin);

        for (let i = 0; i < BOOKS.length; i++) {
            const { title, author, yearOfPublication, description, ISBN, stock } = BOOKS[i];
            const book = await Book.create({
                title, author, yearOfPublication, stock, description, ISBN, added: new Date()
            });

            await Admin.findByIdAndUpdate(_admin.id, { $addToSet: { addedBooks: book.id } });
        };

        return;
    })
    .then(() => mongoose.disconnect());