import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';

export interface HealthResponse {
  status: 'ok' | 'degraded';
  database: 'connected' | 'disconnected';
  timestamp: Date;
  uptime: number;
}

@Controller('health')
@ApiTags('Health')
export class HealthController {
  private startTime = Date.now();

  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check del servidor' })
  @ApiResponse({
    status: 200,
    description: 'Servidor activo y funcionando',
    example: {
      success: true,
      message: 'Success',
      data: {
        status: 'ok',
        database: 'connected',
        timestamp: '2026-02-23T10:30:00.000Z',
        uptime: 3600,
      },
    },
  })
  async check(): Promise<HealthResponse> {
    return {
      status: 'ok',
      database: 'connected',
      timestamp: new Date(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }
}
