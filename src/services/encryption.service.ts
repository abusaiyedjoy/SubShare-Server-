export class EncryptionService {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

// Simple XOR-based encryption (for demo purposes)
   // In production, use proper encryption like AES

  encrypt(text: string): string {
    let encrypted = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ this.key.charCodeAt(i % this.key.length);
      encrypted += String.fromCharCode(charCode);
    }
    return Buffer.from(encrypted, 'binary').toString('base64');
  }

  decrypt(encryptedText: string): string {
    const text = Buffer.from(encryptedText, 'base64').toString('binary');
    let decrypted = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ this.key.charCodeAt(i % this.key.length);
      decrypted += String.fromCharCode(charCode);
    }
    return decrypted;
  }

  // Encrypt credentials object
  encryptCredentials(username: string, password: string): { 
    encryptedUsername: string; 
    encryptedPassword: string;
  } {
    return {
      encryptedUsername: this.encrypt(username),
      encryptedPassword: this.encrypt(password),
    };
  }

  // Decrypt credentials object
  decryptCredentials(encryptedUsername: string, encryptedPassword: string): { 
    username: string; 
    password: string;
  } {
    return {
      username: this.decrypt(encryptedUsername),
      password: this.decrypt(encryptedPassword),
    };
  }
}

export function createEncryptionService(key: string): EncryptionService {
  return new EncryptionService(key);
}