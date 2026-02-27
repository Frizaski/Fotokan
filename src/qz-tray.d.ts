declare module 'qz-tray' {
  interface QZ {
    websocket: {
      connect(options?: any): Promise<void>;
      disconnect(): Promise<void>;
      isActive(): boolean;
    };
    security: {
      setCertificatePromise(callback: (resolve: (cert: string) => void, reject: (err: Error) => void) => void): void;
      setSignatureAlgorithm(algorithm: string): void;
      setSignaturePromise(callback: (toSign: string) => (resolve: (sig: string) => void, reject: (err: Error) => void) => void): void;
    };
    printers: {
      find(query?: string): Promise<string | string[]>;
      getDefault(): Promise<string>;
    };
    configs: {
      create(printer: string, options?: any): any;
    };
    print(config: any, data: any[]): Promise<void>;
  }

  const qz: QZ;
  export default qz;
}
