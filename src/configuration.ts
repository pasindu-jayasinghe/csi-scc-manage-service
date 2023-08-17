
export default () => ({
    database: {
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      database: process.env.DB_DATABASE,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      synchronize: parseInt(process.env.SYN) == 1,
      migrationsRun: false,
        logging: true,
        logger: 'file',
    },
  });