/**
 * 图片生成结果缓存
 * 用于提高重复请求的响应速度
 */

import { getPerformanceConfig } from './performance-config';

interface CacheEntry {
  result: Buffer;
  timestamp: number;
  style: string;
  sourceImageHash: string;
}

export class ImageCache {
  private cache: Map<string, CacheEntry> = new Map();
  private config = getPerformanceConfig();
  
  /**
   * 生成缓存键
   */
  private generateCacheKey(sourceImageUrl: string, style: string): string {
    // 使用URL和样式的组合作为缓存键
    // 在实际应用中，可以使用图片的hash值来更精确地识别相同图片
    return `${style}:${sourceImageUrl}`;
  }
  
  /**
   * 获取缓存结果
   */
  get(sourceImageUrl: string, style: string): Buffer | null {
    if (!this.config.enableCache) {
      return null;
    }
    
    const key = this.generateCacheKey(sourceImageUrl, style);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // 检查是否过期
    const now = Date.now();
    if (now - entry.timestamp > this.config.cacheExpiry) {
      this.cache.delete(key);
      console.log(`🗑️ [缓存] 条目已过期: ${key}`);
      return null;
    }
    
    console.log(`💾 [缓存命中] ${key}, 年龄: ${Math.round((now - entry.timestamp) / 1000)}秒`);
    return entry.result;
  }
  
  /**
   * 设置缓存结果
   */
  set(sourceImageUrl: string, style: string, result: Buffer): void {
    if (!this.config.enableCache) {
      return;
    }
    
    const key = this.generateCacheKey(sourceImageUrl, style);
    const entry: CacheEntry = {
      result,
      timestamp: Date.now(),
      style,
      sourceImageHash: sourceImageUrl // 简化版本，实际应该使用hash
    };
    
    this.cache.set(key, entry);
    console.log(`💾 [缓存存储] ${key}, 大小: ${Math.round(result.length / 1024)}KB`);
    
    // 检查缓存大小限制
    this.cleanupIfNeeded();
  }
  
  /**
   * 清理过期缓存
   */
  private cleanupIfNeeded(): void {
    const now = Date.now();
    const maxAge = this.config.cacheExpiry;
    
    // 计算当前缓存大小
    let totalSize = 0;
    this.cache.forEach(entry => {
      totalSize += entry.result.length;
    });
    
    const totalSizeMB = totalSize / (1024 * 1024);
    
    // 如果超过大小限制，清理最旧的条目
    if (totalSizeMB > this.config.maxCacheSize) {
      console.log(`🧹 [缓存清理] 当前大小: ${totalSizeMB.toFixed(2)}MB, 限制: ${this.config.maxCacheSize}MB`);
      
      // 按时间戳排序，删除最旧的条目
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      let removedSize = 0;
      const targetRemoval = totalSizeMB - this.config.maxCacheSize * 0.8; // 清理到80%
      
      for (const [key, entry] of entries) {
        if (removedSize >= targetRemoval * 1024 * 1024) {
          break;
        }
        
        this.cache.delete(key);
        removedSize += entry.result.length;
      }
      
      console.log(`🧹 [缓存清理] 已清理 ${Math.round(removedSize / 1024)}KB`);
    }
    
    // 清理过期条目
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > maxAge) {
        this.cache.delete(key);
      }
    });
  }
  
  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
    console.log('🗑️ [缓存] 已清空所有缓存');
  }
  
  /**
   * 获取缓存统计信息
   */
  getStats(): {
    size: number;
    entries: number;
    totalSizeMB: number;
  } {
    let totalSize = 0;
    this.cache.forEach(entry => {
      totalSize += entry.result.length;
    });
    
    return {
      size: this.cache.size,
      entries: this.cache.size,
      totalSizeMB: totalSize / (1024 * 1024)
    };
  }
}

// 创建全局缓存实例
export const imageCache = new ImageCache();
