import * as awsx from "@pulumi/awsx"
import { cluster } from '../cluster'
import { appLoadBalancer, networkLoadBalancer } from "../load-balancer"

// Faz balanceamento das instâncias ativas dos meus containers
const rabbitMQAdminTargetGroup = appLoadBalancer.createTargetGroup('rabbitmq-admin-target', {
  port: 15672,
  protocol: 'HTTP',
  healthCheck: {
    path: '/',
    protocol: 'HTTP'
  }
})

// Listener é quem ouve as requisições do API Gateway no Load Balancer
export const rabbitMQAdminHttpListener = appLoadBalancer.createListener('rabbitmq-admin-listener', {
  port: 15672, // porta http do nosso rabbitmq
  protocol: 'HTTP',
  targetGroup: rabbitMQAdminTargetGroup
})

const amqpTargetGroup = networkLoadBalancer.createTargetGroup('amqp-target', {
  protocol: 'TCP',
  port: 5672,
  targetType: 'ip',
  healthCheck: {
    protocol: 'TCP',
    port: '5672'
  }
})

export const amqpListener = networkLoadBalancer.createListener('amqp-listener', {
  port: 5672,
  protocol: 'TCP',
  targetGroup: amqpTargetGroup
})

export const rabbitMQService = new awsx.classic.ecs.FargateService('fargate-rabbitmq', {
  cluster,
  desiredCount: 1, // Eu quero uma instância desse serviço
  waitForSteadyState: false, // Sobe a imagem sem esperar o app ficar no ar
  taskDefinitionArgs: { // config do container
    container: {
      image: 'rabbitmq:3-management', // imagem do container
      cpu: 256, // 1/4 de 1024 => 1/4 de uma cpu
      memory: 512, // 0.5GB de memória
      portMappings: [
        rabbitMQAdminHttpListener, // listener do rabbitmq com targetGroup
        amqpListener // listener do rabbitMQ para TCP com targetGroup
      ],
      environment: [ // variaveis de ambiente lá na aws
        { name: 'RABBITMQ_DEFAULT_USER', value: 'admin' },
        { name: 'RABBITMQ_DEFAULT_PASS', value: 'admin' },
      ]
    }
  }
})