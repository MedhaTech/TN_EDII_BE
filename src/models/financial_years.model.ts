import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, or } from 'sequelize';
import db from '../utils/dbconnection.util';
import { constents } from '../configs/constents.config';


export class financial_years extends Model<InferAttributes<financial_years>, InferCreationAttributes<financial_years>> {
    declare financial_year_id: CreationOptional<number>;
    declare financial_year_name: string;
    declare year_start: Date;
    declare year_end: Date;
    declare status: Enumerator;
    declare created_by: number;
    declare created_at: Date;
    declare updated_by: number;
    declare updated_at: Date;
    
}

financial_years.init({
    financial_year_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    financial_year_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    year_start: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    year_end: {
        type: DataTypes.DATE,
        allowNull: true,
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
        tableName: 'financial_years',
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at',
    }

);