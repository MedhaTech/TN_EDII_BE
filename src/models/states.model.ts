import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, or } from 'sequelize';
import db from '../utils/dbconnection.util';
import { constents } from '../configs/constents.config';
import { districts } from './districts.model';


export class states extends Model<InferAttributes<states>, InferCreationAttributes<states>> {
    declare state_id: CreationOptional<number>;
    declare state_name: string;
    declare state_name_vernacular: string;
    declare status: Enumerator;
    declare created_by: number;
    declare created_at: Date;
    declare updated_by: number;
    declare updated_at: Date;
    
}

states.init({
    state_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    state_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    state_name_vernacular: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.ENUM(...Object.values(constents.institutions_status_flags.list)),
        defaultValue: constents.institutions_status_flags.default
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        onUpdate: new Date().toLocaleString()
    }
},
    {
        sequelize: db,
        tableName: 'states',
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at',
    }

);
states.belongsTo(districts, {targetKey: 'state_id',foreignKey: 'state_id', constraints: false });
districts.hasOne(states, { sourceKey: 'state_id', foreignKey: 'state_id', constraints: false });