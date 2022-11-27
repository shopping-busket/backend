// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes, Model } from 'sequelize';
import { Application } from '../declarations';
import { HookReturn } from 'sequelize/types/hooks';

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const list = sequelizeClient.define('list', {
    listid: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    owner: {
      type: DataTypes.UUID
    },
    name: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    },
    entries: {
      type: DataTypes.JSONB
    },
    checkedEntries: {
      type: DataTypes.JSONB,
    },
    backgroundURI: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    }
  }, {
    hooks: {
      beforeCount(options: any): HookReturn {
        options.raw = false;
      }
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (list as any).associate = function (models: any): void {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return list;
}
