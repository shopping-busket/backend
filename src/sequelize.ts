import { Sequelize } from 'sequelize';
import { Application } from './declarations';

export default function (app: Application): void {
  const connectionString = app.get('postgres');
  const sequelize = new Sequelize(connectionString, {
    dialect: 'postgres', // sqlite
    logging: false,
    define: {
      freezeTableName: true
    }
  });
  const oldSetup = app.setup;

  app.set('sequelizeClient', sequelize);

  app.setup = function (...args): Application {
    const result = oldSetup.apply(this, args);

    // Set up data relationships
    const models = sequelize.models;
    Object.keys(models).forEach(name => {
      if ('associate' in models[name]) {
        (models[name] as any).associate(models);
      }
    });

    // Sync to the database
    try {
      app.set('sequelizeSync', sequelize.sync({ logging: i => console.log(`${i}\n`), force: false }));
    } catch (e) {
      console.error(e);
    }

    return result;
  };
}
