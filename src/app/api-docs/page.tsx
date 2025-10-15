'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { swaggerSpec } from '@/lib/swagger';

export default function ApiDocsPage() {
  return (
    <div>
      <SwaggerUI spec={swaggerSpec} />
    </div>
  );
}
