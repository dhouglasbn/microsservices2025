import { fastify } from 'fastify'
import { fastifyCors } from '@fastify/cors'
import { z } from 'zod'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider
} from 'fastify-type-provider-zod'
import { channels } from '../broker/channels/index.ts'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

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

  console.log(' Creating an order with amount', amount);

  // Aqui foi criada uma queue orders
  // la na page do RabbitMQ no localhost:15672
  // eu consigo ver em getMessages que chegou o buffer

  channels.orders.sendToQueue('orders', Buffer.from('Hello World'))
  
  return reply.status(201).send()
})

app.listen({ host: '0.0.0.0', port: 3333 }).then(() => {
  console.log('[Orders] - HTTP Server running!');
})