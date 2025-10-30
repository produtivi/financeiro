import { z } from 'zod';

export const criarGrupoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  descricao: z.string().optional(),
  ativo: z.boolean().optional().default(true),
});

export const atualizarGrupoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres').optional(),
  descricao: z.string().optional(),
  ativo: z.boolean().optional(),
});

export type CriarGrupoDTO = z.infer<typeof criarGrupoSchema>;
export type AtualizarGrupoDTO = z.infer<typeof atualizarGrupoSchema>;
