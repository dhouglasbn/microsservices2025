import { fastify } from 'fastify'
import { fastifyCors } from '@fastify/cors'
import { z } from 'zod'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider
} from 'fastify-type-provider-zod'
import { channels } from '../broker/channels/index.ts'
import { db } from '../db/client.ts'
import { schema } from '../db/schema/index.ts'
import { randomUUID } from 'node:crypto'
import { dispatchOrderCreated } from '../broker/messages/order-created.ts'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyCors, { origin: '*'})

/** Escalonamento horizontal 
 * 
 * Quando minhas maquinas se comunicam elas usam a rota /health
 * para entender que as máquinas podem se comunicar.
 */

/** Blue-green deployment
 * 
 * Quando tu tem uma versão 1 em deploy e
 * tu faz deploy da versão 2, o b-g deployment espera a rota /health
 * dar ok para entender que a versão 2 está no ar e ir passando todos os
 * usuários para a versão 2 até matar a versão 1.
 */
app.get('/health', () => 'OK')

app.post('/orders', {
  schema: {
    body: z.object({
      amount: z.coerce.number(),
    })
  }
}, async (request, reply) => {
  const { amount } = request.body
  const orderId = randomUUID()

  console.log('Creating an order with amount', amount);

  dispatchOrderCreated({
    orderId,
    amount,
    customer: {
      id: 'cbd3c623-a109-4d4b-ad4c-303746f49bff'
    }
  })

  await db.insert(schema.orders).values({
    id: orderId,
    customerId: 'cbd3c623-a109-4d4b-ad4c-303746f49bff',
    amount
  })
  
  return reply.status(201).send()
})

app.listen({ host: '0.0.0.0', port: 3333 }).then(() => {
  console.log('[Orders] - HTTP Server running!');
})