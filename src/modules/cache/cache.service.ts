import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * CacheService
 * Wrapper tipo-seguro sobre @nestjs/cache-manager con Redis
 *
 * Responsabilidades:
 * - Abstraer la implementación de cache (Redis)
 * - Proporcionar métodos tipados: get<T>(), set(), del(), exists(), flush(), delPattern()
 * - Manejar TTL automáticamente (en milisegundos)
 * - Simplificar la interfaz para toda la aplicación
 * - Graceful degradation si Redis falla
 *
 * Uso:
 * ```typescript
 * // En cualquier servicio (ej: QrCodesService):
 * constructor(private cache: CacheService) {}
 *
 * // Set con TTL en MILISEGUNDOS
 * await this.cache.set('user:1', userData, 3600000); // 1 hora
 * await this.cache.set('qr:123', qrData, 604800000); // 7 días
 *
 * // Get con tipo genérico
 * const user = await this.cache.get<User>('user:1');
 * if (!user) {
 *   // Cache miss - fetch from DB
 *   const freshUser = await this.userService.findById(1);
 *   await this.cache.set('user:1', freshUser, 3600000);
 *   return freshUser;
 * }
 *
 * // Delete
 * await this.cache.del('user:1');
 *
 * // Check if key exists
 * const exists = await this.cache.exists('user:1');
 *
 * // Delete by pattern (glob)
 * await this.cache.delPattern('qr:*'); // Delete all QR codes
 * ```
 */

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Obtener valor del cache
   * @typeParam T - Tipo del valor almacenado
   * @param key - Clave del cache
   * @returns Valor del tipo T o null si no existe
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<T>(key);
      return value ?? null;
    } catch (error) {
      console.error(`[CacheService] Error getting key "${key}":`, error);
      return null; // Graceful degradation: retorna null si hay error
    }
  }

  /**
   * Almacenar valor en cache con TTL
   * @param key - Clave del cache
   * @param value - Valor a almacenar (será serializado a JSON)
   * @param ttl - Time-to-live en MILISEGUNDOS (opcional, usa default de config si undefined)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      // cache-manager v7 espera ttl en milisegundos
      // Si no se proporciona TTL, usa el default de la configuración
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      console.error(`[CacheService] Error setting key "${key}":`, error);
      // Graceful degradation: continúa si falla cache
    }
  }

  /**
   * Eliminar clave del cache
   * @param key - Clave a eliminar
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      console.error(`[CacheService] Error deleting key "${key}":`, error);
    }
  }

  /**
   * Verificar si una clave existe en el cache
   * @param key - Clave a verificar
   * @returns true si la clave existe, false si no existe o en caso de error
   */
  async exists(key: string): Promise<boolean> {
    try {
      const value = await this.cacheManager.get(key);
      return value !== undefined && value !== null;
    } catch (error) {
      console.error(`[CacheService] Error checking key "${key}":`, error);
      return false;
    }
  }

  /**
   * Limpiar TODA la cache (solo para tests/admin)
   * ⚠️ USO RESTRINGIDO: Solo en tests y funciones administrativas
   *
   * Nota: cache-manager requiere acceso directo al store
   * Para uso en tests, considerar usar fixture factories en su lugar
   */
  async flush(): Promise<void> {
    try {
      const cacheManager = this.cacheManager as any;
      // Intentar métodos comunes en diferentes versiones
      if (typeof cacheManager.reset === 'function') {
        await cacheManager.reset();
      } else if (typeof cacheManager.clear === 'function') {
        await cacheManager.clear();
      }
      console.warn('[CacheService] Cache flushed (admin operation)');
    } catch (error) {
      console.error('[CacheService] Error flushing cache:', error);
    }
  }

  /**
   * Eliminar múltiples claves a la vez (patrón glob)
   * ⚠️ Nota: cache-manager-redis-store expone keys() en el store
   *
   * Ejemplos:
   * - 'user:1:*' → borra user:1:profile, user:1:settings, etc.
   * - 'qr:*' → borra todos los QR codes
   *
   * @param pattern - Patrón de claves (con wildcard *)
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      const cacheManager = this.cacheManager as any;
      // Acceso directo al store de redis-cache-manager
      const keys = await cacheManager.store?.keys?.();

      if (!keys || !Array.isArray(keys)) {
        console.warn(
          `[CacheService] Cannot access keys for pattern "${pattern}"`,
        );
        return;
      }

      const regex = this.patternToRegex(pattern);
      const keysToDelete = keys.filter((key: string) => regex.test(key));

      if (keysToDelete.length === 0) {
        return;
      }

      const promises = keysToDelete.map((key: string) =>
        this.cacheManager.del(key),
      );
      await Promise.all(promises);

      console.debug(
        `[CacheService] Deleted ${keysToDelete.length} keys matching pattern "${pattern}"`,
      );
    } catch (error) {
      console.error(
        `[CacheService] Error deleting pattern "${pattern}":`,
        error,
      );
    }
  }

  /**
   * Convertir patrón glob a expresión regular
   * @param pattern - Patrón con wildcards (ej: 'user:1:*')
   * @returns RegExp
   */
  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    const regex = escaped.replace(/\*/g, '.*');
    return new RegExp(`^${regex}$`);
  }
}
