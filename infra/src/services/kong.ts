import * as awsx from "@pulumi/awsx"
import * as pulumi from "@pulumi/pulumi"
import { cluster } from '../cluster'
import { kongDockerImage } from "../images/kong"
import { ordersHttpListener } from './orders'
import { invoicesHttpListener } from './invoices'
import { appLoadBalancer } from "../load-balancer";


// Faz balanceamento das instâncias ativas dos meus containers
const proxyTargetGroup = appLoadBalancer.createTargetGroup('proxy-target', {
  port: 8000,
  protocol: 'HTTP',
  healthCheck: {
    path: '/orders/health', 
    protocol: 'HTTP'
  }
})

// Listener é quem ouve as requisições do API Gateway no Load Balancer
export const proxyHttpListener = appLoadBalancer.createListener('proxy-listener', {
  port: 80, // porta http do nosso rabbitmq
  protocol: 'HTTP',
  targetGroup: proxyTargetGroup
})

// Faz balanceamento das instâncias ativas dos meus containers
const adminTargetGroup = appLoadBalancer.createTargetGroup('admin-target', {
  port: 8002,
  protocol: 'HTTP',
  healthCheck: {
    path: '/', 
    protocol: 'HTTP'
  }
})

// Listener é quem ouve as requisições do API Gateway no Load Balancer
export const adminHttpListener = appLoadBalancer.createListener('admin-listener', {
  port: 8002, // porta http do nosso rabbitmq
  protocol: 'HTTP',
  targetGroup: adminTargetGroup
})

// Faz balanceamento das instâncias ativas dos meus containers
const adminAPITargetGroup = appLoadBalancer.createTargetGroup('admin-api-target', {
  port: 8001,
  protocol: 'HTTP',
  healthCheck: {
    path: '/', 
    protocol: 'HTTP'
  }
})

// Listener é quem ouve as requisições do API Gateway no Load Balancer
export const adminAPIHttpListener = appLoadBalancer.createListener('admin-api-listener', {
  port: 8001, // porta http do nosso rabbitmq
  protocol: 'HTTP',
  targetGroup: adminAPITargetGroup
})

export const kongService = new awsx.classic.ecs.FargateService('fargate-kong', {
  cluster,
  desiredCount: 1, // Eu quero uma instância desse serviço
  waitForSteadyState: false, // Sobe a imagem sem esperar o app ficar no ar
  taskDefinitionArgs: { // config do container
    container: {
      image: kongDockerImage.ref, // imagem do container
      cpu: 256, // 1/4 de 1024 => 1/4 de uma cpu
      memory: 512, // 0.5GB de memória
      portMappings: [
        proxyHttpListener,
        adminHttpListener,
        adminAPIHttpListener
      ],
      environment: [ // variaveis de ambiente lá na aws
        {
          name: 'KONG_DATABASE',
          value: 'off'
        },
        {
          name: 'KONG_ADMIN_LISTEN',
          value: '0.0.0.0:8001'
        },
        {
          name: 'ORDERS_SERVICE_URL',
          value: pulumi.interpolate`http://${ordersHttpListener.endpoint.hostname}:${ordersHttpListener.endpoint.port}`
        },
        {
          name: 'INVOICES_SERVICE_URL',
          value: pulumi.interpolate`http://${invoicesHttpListener.endpoint.hostname}:${invoicesHttpListener.endpoint.port}`
        },
      ]
    }
  }
})