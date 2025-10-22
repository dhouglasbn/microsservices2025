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

# Migrations em produção

## Devem ser retrocompatíveis

Imagine o cenário de uma tabela de usuário que tem first_name e last_name
E agora o p.o quer que esse banco tenha só um campo full_name
Se tu só colocar full name e deletar first_name e last_name esse banco não é retrocompatível
Tu deve criar uma v2 que tem first_name, last_name e full_name
E depois criar uma v3 que tem full_name