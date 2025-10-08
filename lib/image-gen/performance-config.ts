/**
 * 图片生成性能配置
 * 用于优化Google API调用性能
 */

export interface PerformanceConfig {
  // API配置
  apiTimeout: number; // API超时时间（毫秒）
  maxRetries: number; // 最大重试次数
  retryDelay: number; // 重试延迟（毫秒）
  
  // 图片处理配置
  maxImageSize: number; // 最大图片大小（字节）
  enableCompression: boolean; // 是否启用压缩
  compressionQuality: number; // 压缩质量 (0-1)
  
  // 缓存配置
  enableCache: boolean; // 是否启用缓存
  cacheExpiry: number; // 缓存过期时间（毫秒）
  maxCacheSize: number; // 最大缓存大小（MB）
  
  // 监控配置
  enableDetailedLogging: boolean; // 是否启用详细日志
  logSlowRequests: boolean; // 是否记录慢请求
  slowRequestThreshold: number; // 慢请求阈值（毫秒）
}

export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  // API配置 - 针对Google Gemini优化
  apiTimeout: 30000, // 30秒超时
  maxRetries: 2, // 最多重试2次
  retryDelay: 1000, // 1秒基础延迟
  
  // 图片处理配置
  maxImageSize: 5 * 1024 * 1024, // 5MB
  enableCompression: true, // 启用压缩
  compressionQuality: 0.8, // 80%质量
  
  // 缓存配置
  enableCache: true, // 启用缓存
  cacheExpiry: 24 * 60 * 60 * 1000, // 24小时
  maxCacheSize: 100, // 100MB
  
  // 监控配置
  enableDetailedLogging: true, // 启用详细日志
  logSlowRequests: true, // 记录慢请求
  slowRequestThreshold: 5000, // 5秒阈值
};

/**
 * 获取性能配置
 * 支持环境变量覆盖
 */
export function getPerformanceConfig(): PerformanceConfig {
  const config = { ...DEFAULT_PERFORMANCE_CONFIG };
  
  // 从环境变量读取配置
  if (process.env.IMAGE_GEN_API_TIMEOUT) {
    config.apiTimeout = parseInt(process.env.IMAGE_GEN_API_TIMEOUT, 10);
  }
  
  if (process.env.IMAGE_GEN_MAX_RETRIES) {
    config.maxRetries = parseInt(process.env.IMAGE_GEN_MAX_RETRIES, 10);
  }
  
  if (process.env.IMAGE_GEN_ENABLE_CACHE) {
    config.enableCache = process.env.IMAGE_GEN_ENABLE_CACHE === 'true';
  }
  
  if (process.env.IMAGE_GEN_MAX_IMAGE_SIZE) {
    config.maxImageSize = parseInt(process.env.IMAGE_GEN_MAX_IMAGE_SIZE, 10);
  }
  
  return config;
}

/**
 * 性能监控工具
 */
export class PerformanceMonitor {
  private startTime: number = 0;
  private checkpoints: Map<string, number> = new Map();
  
  constructor(private config: PerformanceConfig) {}
  
  start(operation: string): void {
    this.startTime = Date.now();
    this.checkpoints.set('start', this.startTime);
    if (this.config.enableDetailedLogging) {
      console.log(`⏱️ [性能监控] 开始: ${operation}`);
    }
  }
  
  checkpoint(name: string): number {
    const now = Date.now();
    const duration = now - this.startTime;
    this.checkpoints.set(name, now);
    
    if (this.config.enableDetailedLogging) {
      console.log(`📍 [性能监控] ${name}: ${duration}ms`);
    }
    
    return duration;
  }
  
  end(operation: string): number {
    const totalDuration = Date.now() - this.startTime;
    
    if (this.config.logSlowRequests && totalDuration > this.config.slowRequestThreshold) {
      console.warn(`🐌 [慢请求警告] ${operation} 耗时 ${totalDuration}ms (超过阈值 ${this.config.slowRequestThreshold}ms)`);
    }
    
    if (this.config.enableDetailedLogging) {
      console.log(`✅ [性能监控] 完成: ${operation}, 总耗时: ${totalDuration}ms`);
    }
    
    return totalDuration;
  }
  
  getCheckpointDuration(from: string, to: string): number {
    const fromTime = this.checkpoints.get(from);
    const toTime = this.checkpoints.get(to);
    
    if (!fromTime || !toTime) {
      return 0;
    }
    
    return toTime - fromTime;
  }
}
