# 🧩 Microservices Architecture — Node.js, RabbitMQ & AWS

![Microservices Architecture](https://i.imgur.com/1riF5Ix.png)
<p align="center"><em>System Architecture Overview — event-driven microservices using Node.js, RabbitMQ, and AWS</em></p>

---

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Kong](https://img.shields.io/badge/Kong-002E3B?style=for-the-badge&logo=kong&logoColor=white)](https://konghq.com/)
[![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white)](https://aws.amazon.com/)
[![Pulumi](https://img.shields.io/badge/Pulumi-8A3391?style=for-the-badge&logo=pulumi&logoColor=white)](https://www.pulumi.com/)
[![Grafana](https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white)](https://grafana.com/)
[![Jaeger](https://img.shields.io/badge/Jaeger-66C2A5?style=for-the-badge&logo=jaeger&logoColor=white)](https://www.jaegertracing.io/)

---

## 📘 About the Project

This project was developed during a **Rocketseat masterclass**, focusing on how to design, build, and deploy a **microservices-based system** using modern technologies such as **Node.js**, **RabbitMQ**, **Kong API Gateway**, and **AWS** — with **Jaeger** for distributed tracing and **Grafana** for production monitoring.

The architecture is composed of two main microservices:

- **Orders Service** — responsible for creating and managing orders.  
- **Invoices Service** — responsible for generating and storing invoices.  

Each service maintains its own **PostgreSQL** database managed with **Drizzle ORM**, ensuring data isolation and scalability.

---

## ⚙️ Tech Stack

| Category | Technologies |
|-----------|---------------|
| **Language** | Node.js |
| **ORM** | Drizzle ORM |
| **Database** | PostgreSQL |
| **Message Broker** | RabbitMQ |
| **API Gateway** | Kong |
| **Tracing & Monitoring** | Jaeger (dev) / Grafana (prod) |
| **Infrastructure as Code** | Pulumi |
| **Deployment** | AWS (EC2, S3, etc.) & Neon |

---

## 🧠 Core Concepts

- **SAGA Pattern** — coordinates distributed transactions through event-driven communication.  
- **Idempotency** — prevents duplicate side effects when processing repeated messages.  
- **Asynchronous Transactions** — enables non-blocking communication between services via RabbitMQ.  
- **BFF (Backend For Frontend)** — combines multiple service responses into a single HTTP call using GraphQL Federation.  
- **Distributed Tracing** — full observability of request paths using `trace_id` propagation.

---

## 🏗️ Architecture Overview

The system follows an **event-driven architecture**:

1. The **Orders Service** creates a new order and publishes an `order.created` event through **RabbitMQ**.  
2. The **Invoices Service** consumes that event and generates the corresponding invoice.  
3. The **Message Broker** ensures reliable communication even if one of the services is offline.  
4. Each service uses an independent database, promoting scalability and fault tolerance.  
5. The **Kong API Gateway** manages request routing, rate limiting, and authentication.  
6. **Jaeger** and **Grafana** provide visibility into request flows and system health.

---

## 🚀 Deployment with Pulumi + AWS

The entire infrastructure is provisioned using **Pulumi**, ensuring reproducibility and automation:

- EC2 instances for each microservice  
- Neon (PostgreSQL) for persistent storage  
- S3 buckets for log storage  
- Kong API Gateway and RabbitMQ setup  
- Integration with Grafana Cloud for observability  

---

## 🧪 Local Development

### 1. Clone the repository
```bash
git clone https://github.com/your-username/microservices-architecture.git
cd microservices-architecture
```

### 2. Configure environment variables

Create a .env file in each microservice directory (orders and invoices) with your PostgreSQL, RabbitMQ, and JWT settings.

### 3. Start containers

./
```
docker-compose up -d
```

./app-orders
```
docker-compose up -d
```

./app-invoices
```
docker-compose up -d
```

### 4. Test the APIs

- Orders Service -> [http://localhost:3333/orders](http://localhost:3333/orders)
- Invoices Service -> [http://localhost:3334/invoices](http://localhost:3334/invoices)

## 📈 Monitoring
During development, Jaeger provides distributed tracing for debugging and performance insights.
In production, Grafana visualizes metrics and traces, helping identify bottlenecks, errors, and latency across microservices.

## 🧰 Project Structure

```bash
/microservices-architecture
├── services/
│   ├── orders/
│   │   ├── src/
│   │   ├── drizzle/
│   │   └── .env
│   └── invoices/
│       ├── src/
│       ├── drizzle/
│       └── .env
├── api-gateway/
│   └── kong.yaml
├── infra/
│   └── pulumi/
└── README.md

```

## 📚 Key Learnings

- Designing scalable and fault-tolerant microservice architectures
- Decoupling services through event-driven communication with RabbitMQ
- Implementing the SAGA Pattern for distributed transactions
- Managing cloud infrastructure programmatically with Pulumi
- Automated deployment on AWS
- Full observability and tracing with Jaeger and Grafana

## 🧑‍💻 Author
**Dhouglas Bandeira Nobrega**

Fullstack Developer • Node.js | React | AWS | Microservices

LinkedIn: [https://www.linkedin.com/in/dhouglas-bandeira-56b302119/](https://www.linkedin.com/in/dhouglas-bandeira-56b302119/)


GitHub: [https://github.com/dhouglasbn](https://github.com/dhouglasbn)

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT) — feel free to use and adapt it!