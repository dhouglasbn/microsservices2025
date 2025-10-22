import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";
import { cluster } from '../cluster'
import { amqpListener } from './rabbitmq'
import { ordersDockerImage } from '../images/orders'
import { appLoadBalancer } from "../load-balancer";


// ECS + Fargate (Sobe a aplicação passando a imagem do docker)

// Faz balanceamento das instâncias ativas dos meus containers
const ordersTargetGroup = appLoadBalancer.createTargetGroup('orders-target', {
  port: 3333,
  protocol: 'HTTP',
  healthCheck: {
    path: '/health',
    protocol: 'HTTP'
  }
})

// Listener é quem ouve as requisições do API Gateway no Load Balancer
export const ordersHttpListener = appLoadBalancer.createListener('orders-listener', {
  port: 3333, // porta http do nosso rabbitmq
  protocol: 'HTTP',
  targetGroup: ordersTargetGroup
})

// 1/4 vCPU + 512RAM => USD$17/mes
export const ordersService = new awsx.classic.ecs.FargateService('fargate-orders', {
  cluster,
  desiredCount: 1, // Eu quero uma instância desse serviço
  waitForSteadyState: false, // Sobe a imagem sem esperar o app ficar no ar
  taskDefinitionArgs: { // config do container
    container: {
      image: ordersDockerImage.ref, // imagem do container
      cpu: 256, // 1/4 de 1024 => 1/4 de uma cpu
      memory: 512, // 0.5GB de memória
      portMappings: [
        ordersHttpListener
      ],
      environment: [ // Variáveis de ambiente da instância de orders
        {
          name: 'BROKER_URL',
          value: pulumi.interpolate`amqp://admin:admin@${amqpListener.endpoint.hostname}:${amqpListener.endpoint.port}`
        },
        {
          name: 'DATABASE_URL',
          value: 'postgresql://neondb_owner:npg_MFlmKGIn05jE@ep-hidden-cake-a44d0g9z.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
        },
        {
          name: 'OTEL_TRACES_EXPORTER',
          value: 'otlp'
        },
        {
          name: 'OTEL_EXPORTER_OTLP_ENDPOINT',
          value: 'https://otlp-gateway-prod-sa-east-1.grafana.net/otlp'
        },
        {
          name: 'OTEL_EXPORTER_OTLP_HEADERS',
          value: 'Authorization=Basic MTQxMjkxMTpnbGNfZXlKdklqb2lNVFUyTnpFNE15SXNJbTRpT2lKbmNtRm1ZVzVoTFdWMlpXNTBieTF1YjJSbGFuTWlMQ0pySWpvaU5GZExObFZuYlRabWRqZ3lNbXMyT1hOWk5YWlpNMlY0SWl3aWJTSTZleUp5SWpvaWNISnZaQzF6WVMxbFlYTjBMVEVpZlgwPQ=='
        },
        {
          name: 'OTEL_SERVICE_NAME',
          value: 'orders'
        },
        {
          name: 'OTEL_RESOURCE_ATTRIBUTES',
          value: 'service.name=orders,service.namespace=eventonodejs,deployment.environment=production'
        },
        {
          name: 'OTEL_NODE_RESOURCE_DETECTORS',
          value: 'env,host,os'
        },
        {
          name: 'OTEL_NODE_ENABLED_INSTRUMENTATIONS',
          value: 'http,fastify,pg,amqplib'
        },
      ]
    }
  }
})