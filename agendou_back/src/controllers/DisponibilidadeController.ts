import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

interface AuthRequest extends Request {
    userId?: number;
    userRole?: string;
}

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

// Função auxiliar para converter string de data (YYYY-MM-DD) para Date local (meio-dia para evitar problemas de timezone)
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

// Listar disponibilidades
export const listar = async (req: Request, res: Response) => {
    try {
        // Limpar disponibilidades com data passada
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        await prisma.disponibilidade.deleteMany({
            where: {
                data: {
                    lt: hoje
                }
            }
        });

        const { profissionalId, data } = req.query;

        const where: any = {};
        if (profissionalId) where.profissionalId = parseInt(profissionalId as string);
        if (data) {
            const rangeData = criarRangeDataLocal(data as string);
            if (rangeData) {
                where.data = { gte: rangeData.inicio, lte: rangeData.fim };
            }
        }

        const disponibilidades = await prisma.disponibilidade.findMany({
            where,
            include: {
                profissional: { select: { id: true, nome: true } }
            },
            orderBy: [
                { data: "asc" },
                { horaInicio: "asc" }
            ]
        });

        res.json(disponibilidades);
    } catch (err: any) {
        console.error("Erro ao listar disponibilidades:", err);
        res.status(500).json({ message: "Erro ao listar disponibilidades" });
    }
};

// Listar disponibilidades do profissional logado
export const listarPorProfissional = async (req: AuthRequest, res: Response) => {
    try {
        const profissionalId = req.userId!;

        // Limpar disponibilidades com data passada para este profissional
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        await prisma.disponibilidade.deleteMany({
            where: {
                profissionalId,
                data: {
                    lt: hoje
                }
            }
        });

        const disponibilidades = await prisma.disponibilidade.findMany({
            where: { profissionalId },
            orderBy: [
                { data: "asc" },
                { horaInicio: "asc" }
            ]
        });

        res.json(disponibilidades);
    } catch (err: any) {
        console.error("Erro ao listar disponibilidades:", err);
        res.status(500).json({ message: "Erro ao listar disponibilidades" });
    }
};

// Criar disponibilidade
export const criar = async (req: AuthRequest, res: Response) => {
    try {
        const profissionalId = req.userId!;
        const { data, horaInicio, horaFim, intervaloMin } = req.body;

        if (!data || horaInicio === undefined || horaFim === undefined) {
            return res.status(400).json({ message: "Campos obrigatórios: data, horaInicio, horaFim" });
        }

        // Converter data string para Date local
        const dataLocal = dataStringParaLocal(data);
        if (!dataLocal) {
            return res.status(400).json({ message: "Formato de data inválido. Use YYYY-MM-DD" });
        }

        // Criar range para verificar conflitos
        const rangeData = criarRangeDataLocal(data);
        if (!rangeData) {
            return res.status(400).json({ message: "Formato de data inválido. Use YYYY-MM-DD" });
        }

        // Verificar conflitos usando range
        const conflito = await prisma.disponibilidade.findFirst({
            where: {
                profissionalId,
                data: {
                    gte: rangeData.inicio,
                    lte: rangeData.fim
                },
                disponivel: true,
                OR: [
                    {
                        horaInicio: { lte: horaFim },
                        horaFim: { gte: horaInicio }
                    }
                ]
            }
        });

        if (conflito) {
            return res.status(400).json({ message: "Já existe disponibilidade neste horário" });
        }

        const disponibilidade = await prisma.disponibilidade.create({
            data: {
                profissionalId,
                data: dataLocal,
                horaInicio: parseInt(horaInicio),
                horaFim: parseInt(horaFim),
                intervaloMin: intervaloMin ? parseInt(intervaloMin) : 30,
                disponivel: true
            }
        });

        res.status(201).json(disponibilidade);
    } catch (err: any) {
        console.error("Erro ao criar disponibilidade:", err);
        res.status(500).json({ message: "Erro ao criar disponibilidade" });
    }
};

// Deletar disponibilidade
export const deletar = async (req: AuthRequest, res: Response) => {
    try {
        const profissionalId = req.userId!;
        const { id } = req.params;

        const disponibilidade = await prisma.disponibilidade.findFirst({
            where: {
                id: parseInt(id),
                profissionalId
            }
        });

        if (!disponibilidade) {
            return res.status(404).json({ message: "Disponibilidade não encontrada" });
        }

        await prisma.disponibilidade.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: "Disponibilidade deletada com sucesso" });
    } catch (err: any) {
        console.error("Erro ao deletar disponibilidade:", err);
        res.status(500).json({ message: "Erro ao deletar disponibilidade" });
    }
};

// Horários disponíveis (considerando duração do serviço)
export const horariosDisponiveis = async (req: Request, res: Response) => {
    try {
        const { profissionalId, data, servicoId } = req.query;

        if (!profissionalId || !data || !servicoId) {
            return res.status(400).json({ message: "Parâmetros obrigatórios: profissionalId, data, servicoId" });
        }

        const servico = await prisma.servico.findUnique({
            where: { id: parseInt(servicoId as string) }
        });

        if (!servico || !servico.ativo) {
            return res.status(404).json({ message: "Serviço não encontrado ou inativo" });
        }

        // Parsear data manualmente para evitar problemas de timezone
        const rangeData = criarRangeDataLocal(data as string);
        if (!rangeData) {
            return res.status(400).json({ message: "Formato de data inválido. Use YYYY-MM-DD" });
        }

        // Buscar disponibilidades do dia usando range
        const disponibilidades = await prisma.disponibilidade.findMany({
            where: {
                profissionalId: parseInt(profissionalId as string),
                data: {
                    gte: rangeData.inicio,
                    lte: rangeData.fim
                },
                disponivel: true
            },
            orderBy: [
                { horaInicio: "asc" }
            ]
        });

        // Buscar agendamentos do dia usando range
        const agendamentos = await prisma.agendamento.findMany({
            where: {
                profissionalId: parseInt(profissionalId as string),
                data: {
                    gte: rangeData.inicio,
                    lte: rangeData.fim
                },
                status: { in: ["PENDENTE", "EM_ANDAMENTO"] }
            }
        });

        // Converter horários de agendamento para minutos
        const horariosOcupados = new Set<number>();
        agendamentos.forEach(ag => {
            const [h, m] = ag.hora.split(":").map(Number);
            horariosOcupados.add(h * 60 + m);
        });

        // Gerar horários disponíveis
        const horarios: string[] = [];
        const duracaoMinutos = servico.duracao;
        
        // Verificar se a data é hoje
        const hoje = new Date();
        const hojeString = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
        const ehHoje = data === hojeString;
        const minutosAgora = ehHoje ? (hoje.getHours() * 60 + hoje.getMinutes()) : -1;

        disponibilidades.forEach(disp => {
            const intervalo = disp.intervaloMin || 30;
            let currentMin = disp.horaInicio;

            while (currentMin + duracaoMinutos <= disp.horaFim) {
                // Se for hoje, filtrar horários passados
                if (ehHoje && currentMin <= minutosAgora) {
                    currentMin += intervalo;
                    continue;
                }
                
                // Verificar se o horário não está ocupado
                let disponivel = true;
                for (let i = 0; i < duracaoMinutos; i += intervalo) {
                    if (horariosOcupados.has(currentMin + i)) {
                        disponivel = false;
                        break;
                    }
                }

                if (disponivel) {
                    const horas = Math.floor(currentMin / 60);
                    const minutos = currentMin % 60;
                    horarios.push(`${horas.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}`);
                }

                currentMin += intervalo;
            }
        });

        // Ordenar horários antes de retornar
        horarios.sort((a, b) => {
            const [hA, mA] = a.split(":").map(Number);
            const [hB, mB] = b.split(":").map(Number);
            const minutosA = hA * 60 + mA;
            const minutosB = hB * 60 + mB;
            return minutosA - minutosB;
        });

        res.json(horarios);
    } catch (err: any) {
        console.error("Erro ao buscar horários disponíveis:", err);
        res.status(500).json({ message: "Erro ao buscar horários disponíveis" });
    }
};
