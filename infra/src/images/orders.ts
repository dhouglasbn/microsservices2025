import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as docker from '@pulumi/docker-build'
import * as awsx from "@pulumi/awsx";


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