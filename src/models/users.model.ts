// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes, Model } from 'sequelize';
import { Application } from '../declarations';
import { HookReturn } from 'sequelize/types/hooks';

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const users = sequelizeClient.define('users', {
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatarURI: {
      type: DataTypes.STRING,
    },

    preferredLanguage: {
      type: DataTypes.STRING,
      defaultValue: 'en',
      allowNull: false,
    },
    prefersDarkMode: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    prefersMiniDrawer: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },

    googleId: { type: DataTypes.STRING },
    githubId: { type: DataTypes.STRING },
  }, {
    hooks: {
      beforeCount(options: any): HookReturn {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (users as any).associate = function (models: any): void {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return users;
}
