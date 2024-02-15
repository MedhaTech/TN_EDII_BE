import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, or } from 'sequelize';
import db from '../utils/dbconnection.util';
import { constents } from '../configs/constents.config';


export class themes_problems extends Model<InferAttributes<themes_problems>, InferCreationAttributes<themes_problems>> {
    declare theme_problem_id: CreationOptional<number>;
    declare theme_name: string;
    declare problem_statement: string;
    declare problem_statement_description : string;
    declare status: Enumerator;
    declare created_by: number;
    declare created_at: Date;
    declare updated_by: number;
    declare updated_at: Date;
    
}

themes_problems.init({
    theme_problem_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    theme_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    problem_statement: {
        type: DataTypes.STRING
    },
    problem_statement_description: {
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
        tableName: 'themes_problems',
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at',
    }

);