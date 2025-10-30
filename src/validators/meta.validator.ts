import { z } from 'zod';

export const criarMetaSchema = z.object({
  usuario_id: z.number().int().positive('usuario_id deve ser um número positivo'),
  descricao: z.string().min(3, 'Descrição deve ter no mínimo 3 caracteres'),
  tipo_meta: z.enum(['reserva_financeira', 'controle_inventario', 'meta_vendas', 'pagamento_contas', 'outro'], {
    message: 'tipo_meta inválido'
  }),
  data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'data_inicio deve estar no formato YYYY-MM-DD'),
  data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'data_fim deve estar no formato YYYY-MM-DD'),
});

export const atualizarMetaSchema = z.object({
  descricao: z.string().min(3).optional(),
  tipo_meta: z.enum(['reserva_financeira', 'controle_inventario', 'meta_vendas', 'pagamento_contas', 'outro']).optional(),
  data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const marcarCumpridaSchema = z.object({
  cumprida: z.boolean({
    message: 'cumprida deve ser true ou false'
  })
});

export type CriarMetaInput = z.infer<typeof criarMetaSchema>;
export type AtualizarMetaInput = z.infer<typeof atualizarMetaSchema>;
export type MarcarCumpridaInput = z.infer<typeof marcarCumpridaSchema>;
