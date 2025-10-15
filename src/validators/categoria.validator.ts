import { z } from 'zod';

export const criarCategoriaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome deve ter no máximo 50 caracteres'),
  tipo: z.enum(['receita', 'despesa'], { message: 'Tipo deve ser receita ou despesa' }),
  ativo: z.boolean().optional().default(true),
});

export const atualizarCategoriaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome deve ter no máximo 50 caracteres').optional(),
  tipo: z.enum(['receita', 'despesa'], { message: 'Tipo deve ser receita ou despesa' }).optional(),
  ativo: z.boolean().optional(),
});

export type CriarCategoriaDTO = z.infer<typeof criarCategoriaSchema>;
export type AtualizarCategoriaDTO = z.infer<typeof atualizarCategoriaSchema>;
