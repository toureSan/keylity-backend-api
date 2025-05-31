import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get('check')
  @ApiOperation({ summary: 'Vérifier l\'état de l\'API' })
  @ApiResponse({ 
    status: 200, 
    description: 'L\'API fonctionne correctement',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'ok'
        },
        timestamp: {
          type: 'string',
          example: '2024-02-20T12:00:00.000Z'
        }
      }
    }
  })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }
} 