import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

interface AuthRequest extends Request {
    userId?: number;
    userRole?: string;
    businessId?: number;
}

const HOURS_2_MS = 2 * 60 * 60 * 1000; // 2 horas em milissegundos

// Função auxiliar para criar range de data local (evita problemas de timezone)
function criarRangeDataLocal(dataString: string): { inicio: Date; fim: Date } | null {
    const partes = dataString.trim().split('-');
    if (partes.length !== 3) {
        return null;
    }
    const ano = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const dia = parseInt(partes[2], 10);
    if (isNaN(ano) || isNaN(mes) || isNaN(dia)) {
        return null;
    }
    const dataInicio = new Date(ano, mes, dia, 0, 0, 0, 0);
    const dataFim = new Date(ano, mes, dia, 23, 59, 59, 999);
    if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) {
        return null;
    }
    return { inicio: dataInicio, fim: dataFim };
}

// Função auxiliar para converter string de data (YYYY-MM-DD) para Date local
function dataStringParaLocal(dataString: string): Date | null {
    const partes = dataString.trim().split('-');
    if (partes.length !== 3) {
        return null;
    }
    const ano = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const dia = parseInt(partes[2], 10);
    if (isNaN(ano) || isNaN(mes) || isNaN(dia)) {
        return null;
    }
    // Usar meio-dia (12:00) para evitar problemas de timezone ao salvar
    const dataLocal = new Date(ano, mes, dia, 12, 0, 0, 0);
    if (isNaN(dataLocal.getTime())) {
        return null;
    }
    return dataLocal;
}

// Criar agendamento (cliente)
export const criarCliente = async (req: AuthRequest, res: Response) => {
    try {
        const clienteId = req.userId!;
        const { servicoId, data, hora, profissionalId } = req.body;

        if (!servicoId || !data || !hora || !profissionalId) {
            return res.status(400).json({ message: "Campos obrigatórios: servicoId, data, hora, profissionalId" });
        }

        // Verificar se serviço existe e pertence ao profissional e business
        const servico = await prisma.servico.findFirst({
            where: {
                id: servicoId,
                profissionalId,
                businessId: req.businessId!,
                ativo: true
            }
        });

        if (!servico) {
            return res.status(404).json({ message: "Serviço não encontrado ou inativo" });
        }

        // Converter data string para Date local
        const dataAgendamento = dataStringParaLocal(data);
        if (!dataAgendamento) {
            return res.status(400).json({ message: "Formato de data inválido. Use YYYY-MM-DD" });
        }

        // Criar range para buscar disponibilidades
        const rangeData = criarRangeDataLocal(data);
        if (!rangeData) {
            return res.status(400).json({ message: "Formato de data inválido. Use YYYY-MM-DD" });
        }

        // Converter hora para minutos
        const horaParts = hora.split(":");
        const horaMinutos = parseInt(horaParts[0]) * 60 + parseInt(horaParts[1]);

        // Verificar disponibilidade usando range de data
        const disponibilidade = await prisma.disponibilidade.findFirst({
            where: {
                profissionalId,
                data: {
                    gte: rangeData.inicio,
                    lte: rangeData.fim
                },
                horaInicio: { lte: horaMinutos },
                horaFim: { gte: horaMinutos + servico.duracao },
                disponivel: true
            }
        });

        if (!disponibilidade) {
            return res.status(400).json({ message: "Horário não disponível" });
        }

        // Verificar se já existe agendamento no mesmo horário usando range
        const agendamentoExistente = await prisma.agendamento.findFirst({
            where: {
                profissionalId,
                businessId: req.businessId!,
                data: {
                    gte: rangeData.inicio,
                    lte: rangeData.fim
                },
                hora,
                status: { in: ["PENDENTE", "EM_ANDAMENTO"] }
            }
        });

        if (agendamentoExistente) {
            return res.status(400).json({ message: "Horário já ocupado" });
        }

        const agendamento = await prisma.agendamento.create({
            data: {
                businessId: req.businessId!,
                clienteId,
                profissionalId,
                servicoId,
                data: dataAgendamento,
                hora,
                status: "PENDENTE"
            },
            include: {
                servico: true,
                cliente: { select: { nome: true, email: true, telefone: true } },
                profissional: { select: { nome: true } }
            }
        });

        res.status(201).json(agendamento);
    } catch (err: any) {
        console.error("Erro ao criar agendamento:", err);
        res.status(500).json({ message: "Erro ao criar agendamento" });
    }
};

// Listar agendamentos do cliente
export const listarCliente = async (req: AuthRequest, res: Response) => {
    try {
        const clienteId = req.userId!;

        const agendamentos = await prisma.agendamento.findMany({
            where: { 
                clienteId,
                businessId: req.businessId!
            },
            include: {
                servico: true,
                profissional: { select: { nome: true, telefone: true } }
            },
            orderBy: [
                { data: "asc" },
                { hora: "asc" }
            ]
        });

        res.json(agendamentos);
    } catch (err: any) {
        console.error("Erro ao listar agendamentos do cliente:", err);
        res.status(500).json({ message: "Erro ao listar agendamentos" });
    }
};

// Listar agendamentos do profissional
export const listarProfissional = async (req: AuthRequest, res: Response) => {
    try {
        const profissionalId = req.userId!;
        const { clienteNome, data } = req.query;

        const where: any = { 
            profissionalId,
            businessId: req.businessId!
        };

        if (clienteNome) {
            where.cliente = {
                nome: { contains: clienteNome as string, mode: "insensitive" }
            };
        }

        if (data) {
            // Usar parsing manual de data local para evitar problemas de timezone
            const rangeData = criarRangeDataLocal(data as string);
            if (rangeData) {
                where.data = {
                    gte: rangeData.inicio,
                    lte: rangeData.fim
                };
            }
        }

        const agendamentos = await prisma.agendamento.findMany({
            where,
            include: {
                servico: true,
                cliente: { select: { nome: true, email: true, telefone: true } }
            },
            orderBy: [
                { data: "asc" },
                { hora: "asc" }
            ]
        });

        res.json(agendamentos);
    } catch (err: any) {
        console.error("Erro ao listar agendamentos do profissional:", err);
        res.status(500).json({ message: "Erro ao listar agendamentos" });
    }
};

// Cancelar agendamento (cliente)
export const cancelarCliente = async (req: AuthRequest, res: Response) => {
    try {
        const clienteId = req.userId!;
        const { id } = req.params;

        const agendamento = await prisma.agendamento.findFirst({
            where: {
                id: parseInt(id),
                clienteId,
                businessId: req.businessId!
            }
        });

        if (!agendamento) {
            return res.status(404).json({ message: "Agendamento não encontrado" });
        }

        if (agendamento.status === "CANCELADO") {
            return res.status(400).json({ message: "Agendamento já está cancelado" });
        }

        if (agendamento.status === "CONCLUIDO") {
            return res.status(400).json({ message: "Não é possível cancelar um agendamento concluído" });
        }

        if (agendamento.status === "EM_ANDAMENTO") {
            return res.status(400).json({ message: "Não é possível cancelar um agendamento em andamento" });
        }

        // Validar 2 horas antes
        const dataHoraAgendamento = new Date(agendamento.data);
        const [hora, minuto] = agendamento.hora.split(":").map(Number);
        dataHoraAgendamento.setHours(hora, minuto, 0, 0);

        const agora = new Date();
        const diffMs = dataHoraAgendamento.getTime() - agora.getTime();

        if (diffMs < HOURS_2_MS) {
            return res.status(400).json({
                message: "Não é possível cancelar com menos de 2 horas de antecedência"
            });
        }

        await prisma.agendamento.update({
            where: { id: parseInt(id) },
            data: { status: "CANCELADO" }
        });

        res.json({ message: "Agendamento cancelado com sucesso" });
    } catch (err: any) {
        console.error("Erro ao cancelar agendamento:", err);
        res.status(500).json({ message: "Erro ao cancelar agendamento" });
    }
};

// Atualizar status do agendamento (profissional)
export const atualizarStatus = async (req: AuthRequest, res: Response) => {
    try {
        const profissionalId = req.userId!;
        const { id } = req.params;
        const { status } = req.body;

        if (!["PENDENTE", "EM_ANDAMENTO", "CONCLUIDO", "CANCELADO"].includes(status)) {
            return res.status(400).json({ message: "Status inválido" });
        }

        const agendamento = await prisma.agendamento.findFirst({
            where: {
                id: parseInt(id),
                profissionalId,
                businessId: req.businessId!
            }
        });

        if (!agendamento) {
            return res.status(404).json({ message: "Agendamento não encontrado" });
        }

        const agendamentoAtualizado = await prisma.agendamento.update({
            where: { id: parseInt(id) },
            data: { status },
            include: {
                servico: true,
                cliente: { select: { nome: true, email: true, telefone: true } }
            }
        });

        res.json(agendamentoAtualizado);
    } catch (err: any) {
        console.error("Erro ao atualizar status:", err);
        res.status(500).json({ message: "Erro ao atualizar status" });
    }
};

// Faturamento do profissional
export const faturamento = async (req: AuthRequest, res: Response) => {
    try {
        const profissionalId = req.userId!;
        const { periodo = "mes" } = req.query;

        const agora = new Date();
        let dataInicio: Date;

        switch (periodo) {
            case "dia":
                dataInicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
                break;
            case "mes":
                dataInicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
                break;
            case "ano":
                dataInicio = new Date(agora.getFullYear(), 0, 1);
                break;
            case "tudo":
                dataInicio = new Date(0); // Data mínima
                break;
            default:
                dataInicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
        }

        // Buscar agendamentos concluídos com todas as informações necessárias
        const agendamentos = await prisma.agendamento.findMany({
            where: {
                profissionalId,
                businessId: req.businessId!,
                status: "CONCLUIDO",
                data: { gte: dataInicio }
            },
            include: {
                servico: { 
                    select: { 
                        id: true,
                        nome: true, 
                        preco: true,
                        duracao: true
                    } 
                },
                cliente: { 
                    select: { 
                        nome: true 
                    } 
                }
            },
            orderBy: [
                { data: "desc" },
                { hora: "desc" }
            ]
        });

        // Calcular receita total e quantidade
        const receitaTotal = agendamentos.reduce((acc, ag) => acc + (ag.servico.preco || 0), 0);
        const quantidade = agendamentos.length;

        // Agrupar por serviço
        const porServicoMap = new Map<string, { nome: string; quantidade: number; receita: number }>();
        agendamentos.forEach(ag => {
            const servicoNome = ag.servico.nome;
            const preco = ag.servico.preco || 0;
            
            if (porServicoMap.has(servicoNome)) {
                const atual = porServicoMap.get(servicoNome)!;
                atual.quantidade += 1;
                atual.receita += preco;
            } else {
                porServicoMap.set(servicoNome, {
                    nome: servicoNome,
                    quantidade: 1,
                    receita: preco
                });
            }
        });
        const porServico = Array.from(porServicoMap.values());

        // Agrupar por data
        const porDataMap = new Map<string, { data: string; quantidade: number; receita: number }>();
        agendamentos.forEach(ag => {
            // Formatar data como YYYY-MM-DD (usar data local para evitar problemas de timezone)
            const ano = ag.data.getFullYear();
            const mes = String(ag.data.getMonth() + 1).padStart(2, '0');
            const dia = String(ag.data.getDate()).padStart(2, '0');
            const dataStr = `${ano}-${mes}-${dia}`;
            const preco = ag.servico.preco || 0;
            
            if (porDataMap.has(dataStr)) {
                const atual = porDataMap.get(dataStr)!;
                atual.quantidade += 1;
                atual.receita += preco;
            } else {
                porDataMap.set(dataStr, {
                    data: dataStr,
                    quantidade: 1,
                    receita: preco
                });
            }
        });
        const porData = Array.from(porDataMap.values()).sort((a, b) => a.data.localeCompare(b.data));

        // Agrupar por mês
        const porMesMap = new Map<string, { mes: string; quantidade: number; receita: number }>();
        agendamentos.forEach(ag => {
            // Formatar mês como "MM/YYYY"
            const mes = String(ag.data.getMonth() + 1).padStart(2, '0');
            const ano = ag.data.getFullYear();
            const mesStr = `${mes}/${ano}`;
            const preco = ag.servico.preco || 0;
            
            if (porMesMap.has(mesStr)) {
                const atual = porMesMap.get(mesStr)!;
                atual.quantidade += 1;
                atual.receita += preco;
            } else {
                porMesMap.set(mesStr, {
                    mes: mesStr,
                    quantidade: 1,
                    receita: preco
                });
            }
        });
        const porMes = Array.from(porMesMap.values()).sort((a, b) => {
            // Ordenar por data (mês/ano)
            const [mesA, anoA] = a.mes.split('/').map(Number);
            const [mesB, anoB] = b.mes.split('/').map(Number);
            if (anoA !== anoB) return anoA - anoB;
            return mesA - mesB;
        });

        // Transformar agendamentos no formato esperado pelo frontend
        const agendamentosFormatados = agendamentos.map(ag => {
            // Formatar data como YYYY-MM-DD (usar data local para evitar problemas de timezone)
            const ano = ag.data.getFullYear();
            const mes = String(ag.data.getMonth() + 1).padStart(2, '0');
            const dia = String(ag.data.getDate()).padStart(2, '0');
            const dataStr = `${ano}-${mes}-${dia}`;
            
            return {
                id: ag.id,
                servico: ag.servico.nome,
                cliente: ag.cliente.nome,
                data: dataStr,
                hora: ag.hora,
                preco: ag.servico.preco || 0,
                duracao: `${ag.servico.duracao}min`
            };
        });

        // Retornar no formato esperado pelo frontend
        res.json({
            resumo: {
                totalReceita: receitaTotal,
                totalServicos: quantidade,
                periodo: periodo as string
            },
            porServico,
            porData,
            porMes,
            agendamentos: agendamentosFormatados
        });
    } catch (err: any) {
        console.error("Erro ao buscar faturamento:", err);
        res.status(500).json({ message: "Erro ao buscar faturamento" });
    }
};
