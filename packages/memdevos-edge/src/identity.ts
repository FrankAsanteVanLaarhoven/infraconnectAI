import os from 'os'
import crypto from 'crypto'

class IdentityManager {
  /**
   * Generates a stable hardware fingerprint for the node.
   * SPIFFE-inspired: This is used as the base for SVID (SPIFFE Verifiable Identity Document)
   */
  async getMachineIdentity(): Promise<string> {
    const interfaces = os.networkInterfaces()
    const macs = Object.values(interfaces)
      .flat()
      .filter(i => i && !i.internal && i.mac !== '00:00:00:00:00:00')
      .map(i => i!.mac)
      .sort()

    const entropy = {
      cpu:    os.cpus()[0]?.model ?? 'unknown',
      totalMem: os.totalmem(),
      platform: os.platform(),
      arch:     os.arch(),
      macs:     macs,
      hostname: os.hostname()
    }

    const hash = crypto.createHash('sha256')
      .update(JSON.stringify(entropy))
      .digest('hex')

    return `spiffe://infraconnect.internal/agent/${hash.substring(0, 16).toUpperCase()}`
  }

  /**
   * Simplified attestation. In production, this would exchange 
   * hardware proof for a short-lived x509 SVID.
   */
  async bootstrapAgent(agentId?: string): Promise<{ id: string; key: string }> {
    const spiffeId = await this.getMachineIdentity()
    console.log(`[Identity] Bootstrapping: ${spiffeId}`)
    
    // In our ephemeral architecture, we correlate local hardware identity
    // with the provisioned AGENT_ID.
    return {
      id:  agentId ?? spiffeId,
      key: crypto.randomBytes(32).toString('hex')
    }
  }
}

export const identityManager = new IdentityManager()
