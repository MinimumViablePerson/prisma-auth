import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import 'dotenv/config'

const app = express()
app.use(cors())
app.use(express.json())

const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] })

// give me an id, and I give you a token
function createToken (id: number) {
  // @ts-ignore
  return jwt.sign({ id: id }, process.env.MY_SECRET, { expiresIn: '3days' })
  // jwt.sign(data, secret, options = { expiresIn: '3days' })
}

// give me a valid token and I give you a user
async function getUserFromToken (token: string) {
  // @ts-ignore
  const decodedData = jwt.verify(token, process.env.MY_SECRET)
  const user = await prisma.user.findUnique({
    // @ts-ignore
    where: { id: decodedData.id },
    include: { photos: true }
  })

  return user
}

app.post('/sign-up', async (req, res) => {
  const { email, password } = req.body

  try {
    // generate a hash from their password
    const hash = bcrypt.hashSync(password, 8)
    const user = await prisma.user.create({
      // store the hash instead of their password
      // NEVER STORE THE ACTUAL PASSWORD
      data: { email: email, password: hash },
      include: { photos: true }
    })
    res.send({ user, token: createToken(user.id) })
  } catch (err) {
    // @ts-ignore
    res.status(400).send({ error: err.message })
  }
})

app.post('/sign-in', async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
      include: { photos: true }
    })
    // @ts-ignore
    const passwordMatches = bcrypt.compareSync(password, user.password)

    if (user && passwordMatches) {
      // at this point we know that: the email and password are both valid
      res.send({ user, token: createToken(user.id) })
    } else {
      throw Error('BOOM!')
    }
  } catch (err) {
    res.status(400).send({ error: 'User/password invalid.' })
  }
})

app.get('/validate', async (req, res) => {
  const token = req.headers.authorization

  try {
    // @ts-ignore
    const user = await getUserFromToken(token)
    res.send(user)
  } catch (err) {
    // @ts-ignore
    res.status(400).send({ error: err.message })
  }
})

app.get('/photos', async (req, res) => {
  const token = req.headers.authorization

  try {
    // @ts-ignore
    const user = await getUserFromToken(token)
    // @ts-ignore
    const photos = await prisma.photo.findMany({ where: { userId: user.id } })
    res.send(photos)
  } catch (err) {
    // @ts-ignore
    res.status(400).send({ error: err.message })
  }

  // signed in ??? if they have a valid token, yes!
  // if the token is valid, we know they are signed in
  // and who they are
})

app.delete('/photos/:id', async (req, res) => {
  const token = req.headers.authorization || ''
  const id = Number(req.params.id)

  try {
    // check that they are signed in
    const user = await getUserFromToken(token)

    // check if the picture belongs to them
    const photo = await prisma.photo.findUnique({ where: { id } })

    if (photo?.userId === user?.id) {
      // if it does: delete it
      await prisma.photo.delete({ where: { id } })
      res.send({ message: 'Photo successfully deleted.' })
    } else {
      // if it does not: tell them they are not authorised
      res
        .status(401)
        .send({ error: 'You are not authorised to do delete this photo.' })
    }
  } catch (err) {
    // @ts-ignore
    res.status(400).send({ error: err.message })
  }
})

app.post('/photos', async (req, res) => {
  const token = req.headers.authorization || ''
  const { imageUrl, title } = req.body

  try {
    const user = await getUserFromToken(token)
    const photo = await prisma.photo.create({
      data: {
        imageUrl,
        title,
        // @ts-ignore
        userId: user.id
      }
    })
    res.send(photo)
  } catch (err) {
    // @ts-ignore
    res.status(400).send({ error: err.message })
  }
})

app.listen(4000, () => {
  console.log(`Server up: http://localhost:4000`)
})
