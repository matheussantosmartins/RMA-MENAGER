import path from 'node:path';
import swaggerJSDoc from 'swagger-jsdoc';

/** swagger-jsdoc usa `glob`, que interpreta "\" como escape — normalizamos para "/" (necessário no Windows). */
function toPosixGlob(...segments: string[]): string {
  return path
    .join(...segments)
    .split(path.sep)
    .join('/');
}

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'RMA Manager API',
      version: '1.0.0',
      description:
        'API REST para gestão de RMAs (Return Merchandise Authorization) — clientes, produtos, RMAs, histórico de status, upload de imagens e dashboard.',
    },
    servers: [{ url: '/api', description: 'API' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Autenticação e sessão' },
      { name: 'Users', description: 'Gestão de usuários (somente ADMIN)' },
      { name: 'Customers', description: 'Clientes' },
      { name: 'Products', description: 'Produtos' },
      { name: 'RMAs', description: 'Return Merchandise Authorizations' },
      { name: 'Dashboard', description: 'Estatísticas e indicadores' },
    ],
  },
  apis: [toPosixGlob(__dirname, '../modules/**/*.routes.{ts,js}')],
};

export const swaggerSpec = swaggerJSDoc(options);
export const swaggerUiOptions = {
  customSiteTitle: 'RMA Manager API Docs',
};
