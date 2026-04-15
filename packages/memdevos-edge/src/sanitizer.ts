export class Sanitizer {
  // Common PII patterns
  private static readonly PATTERNS = {
    email:  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    token:  /(bearer|api-key|secret|ghp_|ssh-rsa)\s*[:=]\s*["']?[a-zA-Z0-9+=\/_.-]+["']?/gi,
    ip:     /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
  }

  /**
   * Deeply sanitizes a payload object by redacting PII strings.
   */
  static sanitize(payload: any): any {
    if (!payload) return payload

    if (typeof payload === 'string') {
      return this.redactString(payload)
    }

    if (Array.isArray(payload)) {
      return payload.map(item => this.sanitize(item))
    }

    if (typeof payload === 'object') {
      const cleaned: Record<string, any> = {}
      for (const [key, val] of Object.entries(payload)) {
        // Redact specific keys entirely if they are known to contain PII
        if (['email', 'password', 'token', 'secret', 'apiKey'].includes(key.toLowerCase())) {
          cleaned[key] = '[REDACTED_PII]'
        } else {
          cleaned[key] = this.sanitize(val)
        }
      }
      return cleaned
    }

    return payload
  }

  private static redactString(str: string): string {
    let result = str
    result = result.replace(this.PATTERNS.email, '[REDACTED_EMAIL]')
    result = result.replace(this.PATTERNS.token, '$1: [REDACTED_SECRET]')
    result = result.replace(this.PATTERNS.ip, '[REDACTED_IP]')
    return result
  }
}
