'use strict'

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

/** @type {import('@adonisjs/ignitor/src/Helpers')} */
const Helpers = use('Helpers')

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Default Connection
  |--------------------------------------------------------------------------
  |
  | Connection defines the default connection settings to be used while
  | interacting with SQL databases.
  |
  */
  connection: Env.get('DB_CONNECTION', 'mssql'),

  /*
  |--------------------------------------------------------------------------
  | Sqlite
  |--------------------------------------------------------------------------
  |
  | Sqlite is a flat file database and can be good choice under development
  | environment.
  |
  | npm i --save sqlite3
  |
  */
  sqlite: {
    client: 'sqlite3',
    connection: {
      filename: Helpers.databasePath(`${Env.get('DB_DATABASE', 'development')}.sqlite`)
    },
    useNullAsDefault: true
  },

  /*
  |--------------------------------------------------------------------------
  | MySQL
  |--------------------------------------------------------------------------
  |
  | Here we define connection settings for MySQL database.
  |
  | npm i --save mysql
  |
  */
  mysql: {
    client: 'mysql',
    connection: {
      host: Env.get('DB_HOST', 'localhost'),
      port: Env.get('DB_PORT', ''),
      user: Env.get('DB_USER', 'root'),
      password: Env.get('DB_PASSWORD', ''),
      database: Env.get('DB_DATABASE', 'adonis')
    }
  },

  /*
  |--------------------------------------------------------------------------
  | PostgreSQL
  |--------------------------------------------------------------------------
  |
  | Here we define connection settings for PostgreSQL database.
  |
  | npm i --save pg
  |
  */
  pg: {
    client: 'pg',
    connection: {
      host: Env.get('DB_HOST', 'localhost'),
      port: Env.get('DB_PORT', ''),
      user: Env.get('DB_USER', 'root'),
      password: Env.get('DB_PASSWORD', ''),
      database: Env.get('DB_DATABASE', 'adonis')
    }
  },
  // SQL Server
  mssql: {
    client: "mssql",
    connection: {
      type: "mssql",
      host: Env.get("DB_HOST", ""),
      port:parseInt( Env.get("DB_PORT", "")),
      user: Env.get("DB_USER", ""),
      password: Env.get("DB_PASSWORD", ""),
      database: Env.get("DB_DATABASE", "adonis"),    
      options:{ 
        encrypt: false, // Elimina algunos mensajes de warning en la consola
        enableArithAbort: true, // Elimina algunos mensajes de warning en la consola
        trustServerCertificate: true, // Elimina algunos mensajes de warning en la consola
      }  
    }
  },
  historian: {
    client: 'mssql',
    connection: {
      options: {
        enableArithAbort: true,
      },
      host: Env.get('DB_HOST', 'localhost'),
      port: 1433,
      user: Env.get('DB_USER', ''),
      password: Env.get('DB_PASSWORD', ''),
      database: Env.get('DB_DATABASE_PH', ''),
      options:{ 
        encrypt: false, // Elimina algunos mensajes de warning en la consola
        enableArithAbort: true, // Elimina algunos mensajes de warning en la consola
        trustServerCertificate: true, // Elimina algunos mensajes de warning en la consola
      } 
    }
  },
  
  sapServices: {
    client: 'mssql',
    connection: {
      options: {
        enableArithAbort: true,
      },
      host: Env.get('DB_HOST', 'localhost'),
      port: 1433,
      user: Env.get('DB_USER', 'sysa'),
      password: Env.get('DB_PASSWORD', 'edsd5450'),
      database: Env.get('DB_DATABASE', 'PxSapServices'),
      options:{ 
        encrypt: false, // Elimina algunos mensajes de warning en la consola
        enableArithAbort: true, // Elimina algunos mensajes de warning en la consola
        trustServerCertificate: true, // Elimina algunos mensajes de warning en la consola
      } 
    }
  }
}

