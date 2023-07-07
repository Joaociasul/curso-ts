import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { db } from '../database'
import { z } from 'zod'
import crypto from 'node:crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export const transactionsRoutes = async (app: FastifyInstance) => {
  app.get(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = request.cookies.sessionId
      const transactions = await db('transactions')
        .where('session_id', sessionId)
        .select()
      return reply.send({ transactions })
    },
  )

  app.get(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getTransactionParamsSchema.parse(request.params)
      const { sessionId } = request.cookies
      const transaction = await db('transactions')
        .where('id', id)
        .where('session_id', sessionId)
        .first()
      return transaction
    },
  )

  app.get(
    '/summary',
    { preHandler: [checkSessionIdExists] },
    async (request: FastifyRequest) => {
      const sessionId = request.cookies.sessionId
      const summary = await db('transactions')
        .sum('amount', { as: 'amount' })
        .where('session_id', sessionId)
        .first()
      return { summary }
    },
  )

  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const transactionSchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    let sessionId = request.cookies.sessionId
    if (!sessionId) {
      sessionId = crypto.randomUUID()
    }
    reply.cookie('sessionId', sessionId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    const { title, amount, type } = transactionSchema.parse(request.body)
    await db('transactions').insert({
      title,
      amount: type === 'credit' ? amount : amount * -1,
      id: crypto.randomUUID(),
      session_id: sessionId,
    })
    return reply.status(201).send()
  })
}
