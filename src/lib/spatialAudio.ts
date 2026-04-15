export class SpatialAudio {
  private ctx: AudioContext | null = null;
  private bufferCache: Record<string, AudioBuffer> = {};
  public globalMuted = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  async load(name: string, url: string) {
    try {
      this.initCtx();
      if (!this.ctx) {
        console.warn(`Spatial Audio: Context initialization failed for ${name}.`);
        return;
      }

      const res = await fetch(url);
      if (!res.ok) {
        console.error(`Spatial Audio: Asset [${name}] fetch failed with status ${res.status} at ${url}`);
        return;
      }

      const arrayBuffer = await res.arrayBuffer();
      const buffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.bufferCache[name] = buffer;
      console.log(`Spatial Audio: Asset [${name}] primed and ready.`);
    } catch(e: any) {
      console.warn(`Spatial Audio: Loading exception for ${name} (${url}) -> ${e.message}`);
    }
  }

  play(name: string, pan = 0, volume = 1) {
    if (!this.ctx || this.globalMuted) return;
    const buffer = this.bufferCache[name];
    if (!buffer) return;

    if (this.ctx.state === 'suspended') {
        this.ctx.resume();
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = volume;

    const panner = this.ctx.createStereoPanner();
    panner.pan.value = pan;

    source.connect(panner);
    panner.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    source.start(0);
  }
}

export const spatial = new SpatialAudio();
