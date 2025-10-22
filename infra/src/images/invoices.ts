import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as docker from '@pulumi/docker-build'
import * as awsx from "@pulumi/awsx";


const invoicesECRRepository = new awsx.ecr.Repository('invoices-ecr', {
  forceDelete: true // Apaga as imagens na aws quando a gente derruba o repositório
})

const invoicesECRToken = aws.ecr.getAuthorizationTokenOutput({
  registryId: invoicesECRRepository.repository.registryId
})

export const invoicesDockerImage = new docker.Image('invoices-image', {
  tags: [ // Controla as versões da minha imagem
    // O conteúdo da tag depende do repositório estar no ar
    pulumi.interpolate`${invoicesECRRepository.repository.repositoryUrl}:latest` 
  ],
  context: {
    location: '../app-invoices' // onde está o nosso Dockerfile
  },
  push: true, // faz o build da imagem e joga para dentro do repositório
  platforms: [
    'linux/amd64' // processador da amazon
  ],
  registries: [
    { 
      address: invoicesECRRepository.repository.repositoryUrl, // endereço do repositório ECR
      username: invoicesECRToken.userName, // username do token do repositório ECR
      password: invoicesECRToken.password // password do token do repositório ECR
    }
  ]
})