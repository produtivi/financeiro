export interface HtmlToImageOptions {
  html: string;
  css?: string;
  width?: number;
  height?: number;
}

export async function convertHtmlToImage(options: HtmlToImageOptions): Promise<Buffer> {
  const userId = process.env.HCTI_API_USER_ID;
  const apiKey = process.env.HCTI_API_KEY;

  if (!userId || !apiKey) {
    throw new Error('HCTI_API_USER_ID e HCTI_API_KEY devem estar configurados nas variáveis de ambiente');
  }

  const data = {
    html: options.html,
    css: options.css || '',
    viewport_width: options.width || 1200,
    viewport_height: options.height || 1400,
  };

  const auth = Buffer.from(`${userId}:${apiKey}`).toString('base64');

  const response = await fetch('https://hcti.io/v1/image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha ao converter HTML para imagem: ${response.status} - ${errorText}`);
  }

  const result = await response.json();

  if (!result.url) {
    throw new Error('API não retornou URL da imagem');
  }

  const imageResponse = await fetch(result.url);

  if (!imageResponse.ok) {
    throw new Error(`Falha ao baixar imagem: ${imageResponse.status}`);
  }

  const arrayBuffer = await imageResponse.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
