// ============================================================================
// FILE: src/lib/ingest/rate-limiter.ts
// ============================================================================

/**
 * Simple token bucket rate limiter to prevent 429s from external sources
 * and manage the "page budget" defined in the spec.
 */
export class RateLimiter {
    private tokens: number;
    private maxTokens: number;
    private refillRate: number; // tokens per ms
    private lastRefill: number;
  
    constructor(maxRequests: number, timeWindowMs: number) {
      this.maxTokens = maxRequests;
      this.tokens = maxRequests;
      this.refillRate = maxRequests / timeWindowMs;
      this.lastRefill = Date.now();
    }
  
    private refill() {
      const now = Date.now();
      const elapsed = now - this.lastRefill;
      const newTokens = elapsed * this.refillRate;
      
      if (newTokens > 0) {
        this.tokens = Math.min(this.maxTokens, this.tokens + newTokens);
        this.lastRefill = now;
      }
    }
  
    async waitForToken(): Promise<void> {
      this.refill();
      
      if (this.tokens >= 1) {
        this.tokens -= 1;
        return;
      }
  
      // Calculate wait time
      const missingTokens = 1 - this.tokens;
      const waitTime = missingTokens / this.refillRate;
  
      return new Promise((resolve) => {
        setTimeout(() => {
          this.tokens -= 1;
          resolve();
        }, waitTime);
      });
    }
  }
  
  // Global limiter instances
  export const crawlingLimiter = new RateLimiter(10, 60000); // 10 requests per minute per instance
  export const searchLimiter = new RateLimiter(20, 60000);   // 20 searches per minute
  