import { z } from 'zod';

// Schema para formato do agente (array de respostas)
export const criarQuestionarioAgenteSchema = z.object({
  usuario_id: z.number().int().positive('usuario_id deve ser um número positivo'),
  respostas: z.array(z.string()).length(12, 'Deve conter exatamente 12 respostas'),
});

// Schema para formato direto (objeto com campos)
export const criarQuestionarioSchema = z.object({
  usuario_id: z.number().int().positive('usuario_id deve ser um número positivo'),
  resposta_1: z.string().min(1, 'resposta_1 é obrigatória').max(255),
  resposta_2: z.string().min(1, 'resposta_2 é obrigatória').max(255),
  resposta_3: z.string().min(1, 'resposta_3 é obrigatória').max(255),
  resposta_4: z.string().min(1, 'resposta_4 é obrigatória').max(255),
  resposta_5: z.string().min(1, 'resposta_5 é obrigatória').max(255),
  resposta_6: z.string().min(1, 'resposta_6 é obrigatória').max(255),
  resposta_7: z.string().min(1, 'resposta_7 é obrigatória').max(255),
  resposta_8: z.string().min(1, 'resposta_8 é obrigatória').max(255),
  resposta_9: z.string().min(1, 'resposta_9 é obrigatória').max(255),
  resposta_10: z.string().min(1, 'resposta_10 é obrigatória').max(255),
  resposta_11: z.string().optional(),
  resposta_12: z.string().min(1, 'resposta_12 é obrigatória').max(255),
});

export type CriarQuestionarioAgenteDTO = z.infer<typeof criarQuestionarioAgenteSchema>;
export type CriarQuestionarioDTO = z.infer<typeof criarQuestionarioSchema>;

// Função helper para converter array de respostas para objeto
export function converterRespostasParaObjeto(data: CriarQuestionarioAgenteDTO): CriarQuestionarioDTO {
  return {
    usuario_id: data.usuario_id,
    resposta_1: data.respostas[0],
    resposta_2: data.respostas[1],
    resposta_3: data.respostas[2],
    resposta_4: data.respostas[3],
    resposta_5: data.respostas[4],
    resposta_6: data.respostas[5],
    resposta_7: data.respostas[6],
    resposta_8: data.respostas[7],
    resposta_9: data.respostas[8],
    resposta_10: data.respostas[9],
    resposta_11: data.respostas[10] || undefined,
    resposta_12: data.respostas[11],
  };
}
