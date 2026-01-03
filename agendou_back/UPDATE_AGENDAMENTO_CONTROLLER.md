# Atualizações necessárias no AgendamentoController.ts

Preciso adicionar businessId nas seguintes queries:

1. criarCliente:
   - Validar que servico pertence ao businessId
   - Validar que disponibilidade pertence ao businessId
   - Validar que agendamentoExistente pertence ao businessId
   - Criar agendamento com businessId do cliente

2. listarCliente:
   - Filtrar por businessId do cliente

3. listarProfissional:
   - Filtrar por businessId do profissional

4. cancelarCliente:
   - Validar que agendamento pertence ao businessId do cliente

5. atualizarStatus:
   - Validar que agendamento pertence ao businessId do profissional

6. faturamento:
   - Filtrar por businessId do profissional
