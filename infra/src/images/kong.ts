import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as docker from '@pulumi/docker-build'
import * as awsx from "@pulumi/awsx";


const kongECRRepository = new awsx.ecr.Repository('kong-ecr', {
  forceDelete: true // Apaga as imagens na aws quando a gente derruba o repositório
})

const kongECRToken = aws.ecr.getAuthorizationTokenOutput({
  registryId: kongECRRepository.repository.registryId
})

export const kongDockerImage = new docker.Image('kong-image', {
  tags: [ // Controla as versões da minha imagem
    // O conteúdo da tag depende do repositório estar no ar
    pulumi.interpolate`${kongECRRepository.repository.repositoryUrl}:latest` 
  ],
  context: {
    location: '../docker/kong' // onde está o nosso Dockerfile
  },
  push: true, // faz o build da imagem e joga para dentro do repositório
  platforms: [
    'linux/amd64' // processador da amazon
  ],
  registries: [
    { 
      address: kongECRRepository.repository.repositoryUrl, // endereço do repositório ECR
      username: kongECRToken.userName, // username do token do repositório ECR
      password: kongECRToken.password // password do token do repositório ECR
    }
  ]
})