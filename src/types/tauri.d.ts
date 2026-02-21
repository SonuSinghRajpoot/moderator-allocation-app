// Type declarations for Tauri APIs to suppress TypeScript errors during build
declare module '@tauri-apps/api/fs' {
    export function readBinaryFile(path: string): Promise<Uint8Array>
    export function writeBinaryFile(path: string, data: Uint8Array): Promise<void>
}

declare module '@tauri-apps/api/dialog' {
    export function open(options: {
        multiple?: boolean
        filters?: Array<{
            name: string
            extensions: string[]
        }>
        title?: string
    }): Promise<string | string[] | null>
    
    export function save(options: {
        title?: string
        filters?: Array<{
            name: string
            extensions: string[]
        }>
        defaultPath?: string
    }): Promise<string | null>
}

declare module '@tauri-apps/api/path' {
    export function dirname(path: string): Promise<string>
    export function join(...paths: string[]): Promise<string>
}

// Global Tauri object
declare global {
    interface Window {
        __TAURI__?: any
    }
} 