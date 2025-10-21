import { orders } from "./channels/orders.ts";

orders.consume('orders', async message => {
  if (!message) {
    return null
  }

  console.log(message?.content.toString());
  
  orders.ack(message)
}, {
  noAck: false,
})

// acknowledge => reconhecer
// aqui eu tô dizendo que o message broker não vai reconhecer que o evento
// foi reconhecido antes da execução da nossa função.
// aqui eu quero dizer quando a função vai ser reconhecida, e vai ser no final