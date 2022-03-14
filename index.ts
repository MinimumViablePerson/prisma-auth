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

function createToken (id: number) {
  // @ts-ignore
  return jwt.sign({ id: id }, process.env.MY_SECRET, { expiresIn: '10s' })
}

async function getUserFromToken (token: string) {
  // @ts-ignore
  const decodedData = jwt.verify(token, process.env.MY_SECRET)
  // @ts-ignore
  const user = await prisma.user.findUnique({ where: { id: decodedData.id } })

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
      data: { email: email, password: hash }
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
    const user = await prisma.user.findUnique({ where: { email: email } })
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

app.post('/validate', async (req, res) => {
  const { token } = req.body

  try {
    const user = await getUserFromToken(token)
    res.send(user)
  } catch (err) {
    // @ts-ignore
    res.status(400).send({ error: err.message })
  }
})

app.listen(4000, () => {
  console.log(`Server up: http://localhost:4000`)
})
