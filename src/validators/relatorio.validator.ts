import { z } from 'zod';

export const gerarRelatorioSchema = z.object({
  usuario_id: z.number().int().positive('usuario_id deve ser um número positivo'),
  data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'data_inicio deve estar no formato YYYY-MM-DD'),
  data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'data_fim deve estar no formato YYYY-MM-DD'),
  tipo_grafico: z.enum(['geral', 'pizza_receitas', 'pizza_despesas', 'barras_despesas', 'comparativo', 'categorias_especificas'], {
    errorMap: () => ({ message: 'tipo_grafico inválido' })
  }),
  categorias_ids: z.array(z.number().int().positive()).optional(),
  titulo: z.string().max(255).optional(),
  formato: z.enum(['png', 'jpg']).optional().default('png')
});

export type GerarRelatorioInput = z.infer<typeof gerarRelatorioSchema>;
