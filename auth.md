# Auth - In a nutshell:

## Contents
- [Dotenv](#dotenv)
- [Bcrypt](#bcrypt)
- [JWT](#jwt)
- [Helpful Endpoints](#helpful-endpoints)

## Dotenv

A useful library to create and read environment variables.

### Why?
Store/get information privately from a machine, without pushing it to Github.

### Installing:
```bash
npm i dotenv
```

### Working with Dotenv

```js
// this loads all variables created in the .env file
import 'dotenv/config'

// We can then access any variable with:
process.env.MY_VARIABLE_NAME
```

## Bcrypt

### Description

Library that helps us create a **hash** or a password, which is **garbage code that cannot be easily decoded**

### Why?

We do not want to store plain text passwords from our users directly in our DB, because then anybody with access to our DB would be able to see them. Storing this garbage code, we can let bcrypt **compare** the password the user enters when they sign in, with the password they created when they signed up, and can verify they are who they say they are without having to know their actual password.

### Installing:
```bash
npm i bcryptjs @types/bcryptjs
```

### Working with Bcrypt

```js
import bcrypt from 'bcryptjs'

// create a hash
const hash = bcrypt.hashSync(password, 8)

// check if a password matches a hash
const passwordMatches = bcrypt.compareSync(password, user.password)
```

## JWT

### Description

A library that generates a token based on some data given and a secret. It can then verify that a token has a valid signature, and decode its data.

### Why?

This token is a useful piece of information we can store in the browser. Sending this to our server lets our server know that we are holding a token issued by the server, and it can therefore trust we are who we say we are.

### Installing:
```bash
npm i jsonwebtoken @types/jsonwebtoken
```

### Working with JWT

```js
import jwt from 'jsonwebtoken'

// create a token
const token = jwt.sign({ id: 3 }, process.env.MY_SECRET, { expiresIn: '3days' })

// verify and decode a token
// once this is done, we can trust this was a token issued by our server
// we also have the user's id and can find them on our DB
const decodedData = jwt.verify(token, process.env.MY_SECRET)
```

##  Helpful Endpoints

### Create a new account
**Request**: POST `/sign-up` { email, password }
**Response**: { user, token }

### Sign in
**Request**: POST `/sign-in` { email, password }
**Response**: { user, token }

### Validate user
**Request**: POST `/validate` { token }
**Response**: { user }
