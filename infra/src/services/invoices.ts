import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";
import { cluster } from '../cluster'
import { amqpListener } from './rabbitmq'
import { invoicesDockerImage } from '../images/invoices'
import { appLoadBalancer } from "../load-balancer";


// ECS + Fargate (Sobe a aplicação passando a imagem do docker)

// Faz balanceamento das instâncias ativas dos meus containers
const invoicesTargetGroup = appLoadBalancer.createTargetGroup('invoices-target', {
  port: 3334,
  protocol: 'HTTP',
  healthCheck: {
    path: '/health',
    protocol: 'HTTP'
  }
})

// Listener é quem ouve as requisições do API Gateway no Load Balancer
export const invoicesHttpListener = appLoadBalancer.createListener('invoices-listener', {
  port: 3334, // porta http do nosso rabbitmq
  protocol: 'HTTP',
  targetGroup: invoicesTargetGroup
})

// 1/4 vCPU + 512RAM => USD$17/mes
export const invoicesService = new awsx.classic.ecs.FargateService('fargate-invoices', {
  cluster,
  desiredCount: 1, // Eu quero uma instância desse serviço
  waitForSteadyState: false, // Sobe a imagem sem esperar o app ficar no ar
  taskDefinitionArgs: { // config do container
    container: {
      image: invoicesDockerImage.ref, // imagem do container
      cpu: 256, // 1/4 de 1024 => 1/4 de uma cpu
      memory: 512, // 0.5GB de memória
      portMappings: [
        invoicesHttpListener
      ],
      environment: [ // Variáveis de ambiente da instância de invoices
        {
          name: 'BROKER_URL',
          value: pulumi.interpolate`amqp://admin:admin@${amqpListener.endpoint.hostname}:${amqpListener.endpoint.port}`
        },
        {
          name: 'DATABASE_URL',
          value: 'postgresql://neondb_owner:npg_sH5cx7phXrCR@ep-patient-mountain-adm1d728-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
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
          value: 'invoices'
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