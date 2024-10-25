import { Buffer } from 'buffer/'

export interface BlindedPath {
  firstNodeId: string
  firstPathKey: string
  numHops: number
  path: BlindedPathHop[]
}

export interface BlindedPathHop {
  blindedNodeId: string
  encryptedRecipientData: string
}

export class BlindedPathDecoder {
  private pos: number = 0

  constructor(private buffer: Buffer) {}

  private readBytes(length: number): Buffer {
    const result = this.buffer.subarray(this.pos, this.pos + length)
    this.pos += length
    return Buffer.from(result)
  }

  private readByte(): number {
    return this.readBytes(1)[0]
  }

  private readUInt16(): number {
    const result = this.buffer.readUInt16BE(this.pos)
    this.pos += 2
    return result
  }

  private readPoint(): Buffer {
    return this.readBytes(33)
  }

  public decodeBlindedPathHop(): BlindedPathHop {
    const blindedNodeId = this.readPoint().toString('hex')
    const enclen = this.readUInt16()
    const encryptedRecipientData = this.readBytes(enclen).toString('hex')

    return {
      blindedNodeId,
      encryptedRecipientData
    }
  }

  public decodeBlindedPath(): BlindedPath {
    const firstNodeId = this.readPoint().toString('hex')
    const firstPathKey = this.readPoint().toString('hex')
    const numHops = this.readByte()

    const path: BlindedPathHop[] = []
    for (let i = 0; i < numHops; i++) {
      path.push(this.decodeBlindedPathHop())
    }

    return {
      firstNodeId,
      firstPathKey,
      numHops,
      path
    }
  }

  public decodeBlindedPaths(): BlindedPath[] {
    const paths: BlindedPath[] = []

    while (this.pos < this.buffer.length) {
      paths.push(this.decodeBlindedPath())
    }

    return paths
  }
}
export default BlindedPathDecoder
