import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as docker from '@pulumi/docker-build'

const ordersECRRepository = new awsx.ecr.Repository('orders-ecr', {
  forceDelete: true // Apaga as imagens na aws quando a gente derruba o repositório
})

const ordersECRToken = aws.ecr.getAuthorizationTokenOutput({
  registryId: ordersECRRepository.repository.registryId
})

export const ordersDockerImage = new docker.Image('orders-image', {
  tags: [ // Controla as versões da minha imagem
    // O conteúdo da tag depende do repositório estar no ar
    pulumi.interpolate`${ordersECRRepository.repository.repositoryUrl}:latest` 
  ],
  context: {
    location: '../app-orders' // onde está o nosso Dockerfile
  },
  push: true, // faz o build da imagem e joga para dentro do repositório
  platforms: [
    'linux/amd64' // processador da amazon
  ],
  registries: [
    { 
      address: ordersECRRepository.repository.repositoryUrl, // endereço do repositório ECR
      username: ordersECRToken.userName, // username do token do repositório ECR
      password: ordersECRToken.password // password do token do repositório ECR
    }
  ]
})

// ECS + Fargate (Sobe a aplicação passando a imagem do docker)

// 1/4 vCPU + 512RAM => USD$17/mes

const cluster = new awsx.classic.ecs.Cluster('app-cluster')

const ordersService = new awsx.classic.ecs.FargateService('fargate-orders', {
  cluster,
  desiredCount: 1, // Eu quero uma instância desse serviço
  waitForSteadyState: false, // Sobe a imagem sem esperar o app ficar no ar
  taskDefinitionArgs: { // config do container
    container: {
      image: ordersDockerImage.ref, // imagem do container
      cpu: 256, // 1/4 de 1024 => 1/4 de uma cpu
      memory: 512, // 0.5GB de memória
    }
  }
})