import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, or } from 'sequelize';
import db from '../utils/dbconnection.util';
import { constents } from '../configs/constents.config';


export class taluks extends Model<InferAttributes<taluks>, InferCreationAttributes<taluks>> {
    declare taluk_id: CreationOptional<number>;
    declare district_id : number;
    declare taluk_name: string;
    declare taluk_name_vernacular: string;
    declare status: Enumerator;
    declare created_by: number;
    declare created_at: Date;
    declare updated_by: number;
    declare updated_at: Date;
    
}

taluks.init({
    taluk_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    district_id: {
        type: DataTypes.INTEGER
    },
    taluk_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    taluk_name_vernacular: {
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
        tableName: 'taluks',
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at',
    }

);