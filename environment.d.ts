declare global {
    namespace NodeJS {
        interface ProcessEnv {
            Token: string
            environment: 'dev' | 'production'
        }
    }
}
