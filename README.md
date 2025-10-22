# Pulumi e terraform

- EC2
- Auto Scaling Group
- Cloudwatch Logs
- AWS S3 Bucket [Hospeda arquivos de imagem]
- AWS Elemental Media Convert [Converte vídeos]
- AWS RDS PostgreSQL [Bancos de dados]
- AWS Load Balancer
- AWS ECR
- VPC
- Route 53
  - www.meudominio.com

---

IaC (Infraestructure As Code)

```import { s3, ec2, ecr } from 'pulumi'```

<!-- const bucketOrders = new s3.bucket() -->

```
IaC gerencia de forma inteligente a minha infraestrutura em código
Evita o ócio de serviços AWS.
```