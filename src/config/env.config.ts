export const EnvConfig = () => ({
    enviroment: process.env.NODE_END || 'dev',
    mongodb: process.env.MONGODB,
    port: process.env.PORT,
    defaultLimit: Number(process.env.DEFAULT_LIMIT)
});