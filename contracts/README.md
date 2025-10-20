# Contratos

Contratos são o ponto de verdade entre todos os serviços
de quais dados estão trafegando entre todos os microsserviços.

Se for numa empresa podemos podemos publicar num registro
ou por num repositório github, ou qualquer outra maneira.

# Nomes dos canais

## Um erro comum entre iniciantes

Tu tem dois serviços e duas funções

orders
  - create_order
invoices
  - generate_invoice

O iniciante quando executa create_order manda uma mensagem no canal generate_invoice.

Isso tá errado porque devemos dar nomenclaturas a partir dos eventos que aconteceram
e não a partir do que queremos que aconteça.

Então depois de
  - create_order
chamamos
  - order_created