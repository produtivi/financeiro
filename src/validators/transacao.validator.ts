import { z } from 'zod';

export const criarTransacaoSchema = z.object({
  usuario_id: z.number().int().positive('usuario_id deve ser um número positivo'),
  tipo: z.enum(['receita', 'despesa'], { message: 'Tipo deve ser receita ou despesa' }),
  tipo_caixa: z.enum(['pessoal', 'negocio'], { message: 'Tipo de caixa deve ser pessoal ou negocio' }),
  valor: z.number().positive('Valor deve ser positivo'),
  categoria_id: z.number().int().positive('categoria_id deve ser um número positivo'),
  descricao: z.string().optional(),
  tipo_entrada: z.enum(['texto', 'audio', 'foto', 'video', 'nota_fiscal'], {
    message: 'Tipo de entrada deve ser texto, audio, foto, video ou nota_fiscal'
  }).default('texto'),
  arquivo_url: z.string().optional(),
  data_transacao: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Data inválida',
  }),
});

export const atualizarTransacaoSchema = z.object({
  tipo: z.enum(['receita', 'despesa'], { message: 'Tipo deve ser receita ou despesa' }).optional(),
  tipo_caixa: z.enum(['pessoal', 'negocio'], { message: 'Tipo de caixa deve ser pessoal ou negocio' }).optional(),
  valor: z.number().positive('Valor deve ser positivo').optional(),
  categoria_id: z.number().int().positive('categoria_id deve ser um número positivo').optional(),
  descricao: z.string().optional(),
  tipo_entrada: z.enum(['texto', 'audio', 'foto', 'video', 'nota_fiscal']).optional(),
  arquivo_url: z.string().optional(),
  data_transacao: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Data inválida',
    })
    .optional(),
});

export const filtrosTransacaoSchema = z.object({
  usuario_id: z.number().int().positive().optional(),
  tipo: z.enum(['receita', 'despesa']).optional(),
  tipo_caixa: z.enum(['pessoal', 'negocio']).optional(),
  categoria_id: z.number().int().positive().optional(),
  data_inicio: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Data inicial inválida',
  }).optional(),
  data_fim: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Data final inválida',
  }).optional(),
});

export type CriarTransacaoDTO = z.infer<typeof criarTransacaoSchema>;
export type AtualizarTransacaoDTO = z.infer<typeof atualizarTransacaoSchema>;
export type FiltrosTransacaoDTO = z.infer<typeof filtrosTransacaoSchema>;
