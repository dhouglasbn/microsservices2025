import '@opentelemetry/auto-instrumentations-node/register'
import '../broker/subscriber.ts' // instancia quando inicia o server http

import { fastify } from 'fastify'
import { fastifyCors } from '@fastify/cors'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider
} from 'fastify-type-provider-zod'

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

app.listen({ host: '0.0.0.0', port: 3334 }).then(() => {
  console.log('[Invoices] - HTTP Server running!');
})