import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../../core/prisma.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private startTime = Date.now();

  constructor(
    private cacheService: CacheService,
    private prisma: PrismaService,
  ) {}

  /**
   * verigica conexion a base de datos
   * @returns true si la BD esta conectadam, false si no
   */
  async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Fallo Conexion a la base de datos:', error);
      return false;
    }
  }

  /**
   * verificar conexion a Redis
   * @returns true si Redis esta conectado, false si no
   */
  async checkRedis(): Promise<boolean> {
    try {
      const testKey = 'health:check:ping';
      await this.cacheService.set(testKey, 'pong', 10000);

      const result = await this.cacheService.get<string>(testKey);
      if (result === 'pong') {
        await this.cacheService.del(testKey);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Fallo Conexion a Redis:', error);
      return false;
    }
  }

  /**
   * Obtener el tiempo de actividad del servicio
   * @returns Tiempo de actividad en segundos
   */
  getUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * Realizar health check completo
   * @Returns Estado de todos las dependencias
   */
  async performHealthCheck(): Promise<{
    status: 'ok' | 'degraded' | 'unhealthy';
    database: 'connected' | 'disconnected';
    redis: 'connected' | 'disconnected';
    timestamp: Date;
    uptime: number;
  }> {
    const [dbHealthy, redisHealthy] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    let status: 'ok' | 'degraded' | 'unhealthy' = 'ok';
    if (!dbHealthy || !redisHealthy) {
      status = 'degraded';
    }
    if (!dbHealthy && !redisHealthy) {
      status = 'unhealthy';
    }

    return {
      status,
      database: dbHealthy ? 'connected' : 'disconnected',
      redis: redisHealthy ? 'connected' : 'disconnected',
      timestamp: new Date(),
      uptime: this.getUptime(),
    };
  }
}
