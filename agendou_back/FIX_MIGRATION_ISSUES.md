# Correção de Problemas de Migração

## Problemas Identificados

1. **ALTER COLUMN SET NOT NULL falha**: Existem registros com `businessId` NULL que precisam ser limpos antes
2. **Registros órfãos**: Servicos/disponibilidades/agendamentos com `profissionalId` ou `clienteId` inválidos
3. **Foreign Keys inválidas**: Registros apontando para `businessId` que não existe
4. **Índices com nomes diferentes**: DROP INDEX pode falhar se o nome for diferente

## Solução

Foi criada uma migração de correção: `20250117000000_fix_orphan_records_and_constraints`

### O que a migração faz:

1. **Limpa registros órfãos**:
   - Deleta servicos com `profissionalId` inválido ou profissional sem `businessId`
   - Deleta disponibilidades com `profissionalId` inválido
   - Deleta agendamentos com `clienteId` ou `profissionalId` inválidos
   - Deleta agendamentos com `servicoId` inválido

2. **Atualiza businessId NULL**:
   - Atribui `businessId` do profissional/cliente relacionado
   - Se não encontrar, atribui ao business padrão ('default')
   - Se ainda houver NULL, deleta o registro

3. **Valida businessId**:
   - Deleta registros com `businessId` apontando para businesses inexistentes

4. **Aplica NOT NULL**:
   - Apenas após garantir que não há NULLs
   - Usa blocos DO para tratamento de erros

5. **Recria Foreign Keys**:
   - Remove e recria FKs para garantir consistência

6. **Corrige índices**:
   - Remove índices problemáticos de forma segura
   - Recria com os nomes corretos

## Como Aplicar

```bash
# Aplicar a migração de correção
npx prisma migrate deploy

# Ou se estiver em desenvolvimento
npx prisma migrate dev
```

## Verificação

Após aplicar a migração, verifique:

```sql
-- Verificar se há NULLs
SELECT COUNT(*) FROM "servicos" WHERE "businessId" IS NULL;
SELECT COUNT(*) FROM "disponibilidades" WHERE "businessId" IS NULL;
SELECT COUNT(*) FROM "agendamentos" WHERE "businessId" IS NULL;
SELECT COUNT(*) FROM "codigos_acesso" WHERE "businessId" IS NULL;

-- Verificar registros órfãos
SELECT COUNT(*) FROM "servicos" s 
WHERE s."profissionalId" NOT IN (SELECT id FROM "usuarios");

SELECT COUNT(*) FROM "agendamentos" a 
WHERE a."clienteId" NOT IN (SELECT id FROM "usuarios")
   OR a."profissionalId" NOT IN (SELECT id FROM "usuarios");

-- Verificar businessId inválidos
SELECT COUNT(*) FROM "servicos" 
WHERE "businessId" NOT IN (SELECT id FROM "businesses");
```

Todos devem retornar 0.

## Notas

- A migração é **idempotente** (pode ser executada múltiplas vezes)
- Usa `IF EXISTS` e blocos `DO` para tratamento de erros
- Não deleta dados válidos, apenas limpa inconsistências
- Cria business padrão se não existir
