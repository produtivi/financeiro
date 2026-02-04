import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const AGENT_API_URL = process.env.AGENT_API_URL;
    if (!AGENT_API_URL) {
      return NextResponse.json(
        {
          success: false,
          message: 'AGENT_API_URL não configurada',
        },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          message: 'Parâmetros startDate e endDate são obrigatórios',
        },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      startDate,
      endDate,
    });

    const response = await fetch(
      `${AGENT_API_URL}/public/agent-metrics/knowledge-pill-latency?${params}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao buscar dados da API externa',
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao buscar latência de pílulas do conhecimento',
      },
      { status: 500 }
    );
  }
}
