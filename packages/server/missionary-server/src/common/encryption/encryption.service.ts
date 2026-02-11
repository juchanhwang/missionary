import { createCipheriv, createDecipheriv } from 'crypto';

import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptionService implements OnModuleInit {
  private readonly algorithm = 'aes-128-cbc';
  private readonly key: string;

  constructor(private readonly configService: ConfigService) {
    this.key = this.configService.get<string>('AES_ENCRYPT_KEY', '');
    if (!this.key) {
      throw new Error('AES_ENCRYPT_KEY is not defined');
    }
  }

  onModuleInit() {
    if (!this.key) {
      throw new Error('AES_ENCRYPT_KEY is required for EncryptionService');
    }
  }

  /**
   * Encrypts plaintext using aes-128-cbc with key as IV.
   * NOTE: Using key as IV is not secure for new applications, but required here for backward compatibility.
   */
  encrypt(plaintext: string): string {
    const keyBytes = Buffer.from(this.key.substring(0, 16), 'utf-8');
    const ivBytes = keyBytes; // SECURITY WARNING: IV should be random, but keeping for backward compat

    const cipher = createCipheriv(this.algorithm, keyBytes, ivBytes);
    let encrypted = cipher.update(plaintext, 'utf-8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  }

  decrypt(ciphertext: string): string {
    const keyBytes = Buffer.from(this.key.substring(0, 16), 'utf-8');
    const ivBytes = keyBytes;

    const decipher = createDecipheriv(this.algorithm, keyBytes, ivBytes);
    let decrypted = decipher.update(ciphertext, 'base64', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
  }
}
