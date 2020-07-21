# Park's Library App

## Description

This is fullstack App I built in 2.5 days for a company's test. I would like to thank to the company beforehand for the interest they deposited in my skills.

The app features a library service with an Admin and a Member profiles. 

Admins can:

- Add new books to the library, or remove them
- Update book's stock
- Get notifications of new book requests to be added
- Accept new requests of adding new books

Members can:

- Add new requests for new books to be added to the library
- If those requests were added to the library, get additional borrow slots
- Wishlist books
- Borrow books and then return them
- Check the list of borrowed and wishlisted books

And everyone, even guests, can:

- Check books' info that are already in the library (title, description, stock...)
- Sort them by their title on a text input

## Installation

Do not forget to install all dependencies on each directory that provides a `package.json` file, and then run:

```sh
$ npm install
```

Please notice that the API needs `MongoDB` server to be listening before running. Ensure that `MongoDB` is downloaded and running at `localhost:27017`.

## Project Initialization

### Server-side
For the server, located at `library-server`, simply run on the root directory:

```sh
$ npm run start
or
$ npm run watch
```

If you also want some initial data to be displayed, you can additionally run:

```sh
$ npm run add:books
```

### Client-side
For the client, located at `library-app`, simply run on the root directory:

```sh
$ npm run start
```

## Test Coverage

### Server-side
![Coverage server-side](/images/coverage-server.png)

### Client-side
![Coverage client-side](/images/coverage-client.png)

## FAQ

`Why RESTful API instead of other newer options like GraphQL?`

I have built some GraphQL servers myself and I found that a RESTful API would fit better for this application. It is heavily based on PATCH/POST fetch calls which I do not see how I could benefit more through GraphQL. Moreover, some of the core logic of this project involves Date objects, which are hard to store with GraphQL.

`How much time invested to do this project?`

It is important to me to emphasize that I have only took 2.5 days to make this application. The instructions for this test mentioned that 5 days were permitted but 3 were ideal, so I tried to stick on the strict deadline as much as possible. This means that there are some elements that I acknowelge of their current issues (e.g. more componetization with less repeated code) but that I was unable to fix with such short schedule.

`Was TDD implemented to do the logic on both sides?`

Absolutely! TDD is currently the only way I write and approach the logics that I built, and when I have not applied TDD it is because the function is meant to be a helper rather than a logic itself. 

`Why a 'context' on the client-side logic?`

This is a small trick that was taught to me some projects ago that I liked. Basically I attach the `sessionStorage` to that `context` object so that logic becomes stateful. This means that I can keep track of important information (such as the token or the user's role) through the logic without the need to be "moving" that info around components all the time.