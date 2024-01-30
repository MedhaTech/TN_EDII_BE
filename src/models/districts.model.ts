import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, or } from 'sequelize';
import db from '../utils/dbconnection.util';
import { constents } from '../configs/constents.config';
import { taluks } from './taluks.model';


export class districts extends Model<InferAttributes<districts>, InferCreationAttributes<districts>> {
    declare district_id: CreationOptional<number>;
    declare state_id : number;
    declare district_name: string;
    declare district_name_vernacular: string;
    declare district_headquarters: string;
    declare district_headquarters_vernacular: string;
    declare status: Enumerator;
    declare created_by: number;
    declare created_at: Date;
    declare updated_by: number;
    declare updated_at: Date;
    
}

districts.init({
    district_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    state_id: {
        type: DataTypes.INTEGER
    },
    district_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    district_name_vernacular: {
        type: DataTypes.STRING
    },
    district_headquarters: {
        type: DataTypes.STRING
    },
    district_headquarters_vernacular: {
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
        tableName: 'districts',
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at',
    }

);
districts.belongsTo(taluks, {targetKey: 'district_id',foreignKey: 'district_id', constraints: false });
taluks.hasOne(districts, { sourceKey: 'district_id', foreignKey: 'district_id', constraints: false });