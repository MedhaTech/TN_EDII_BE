import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, or } from 'sequelize';
import db from '../utils/dbconnection.util';
import { constents } from '../configs/constents.config';


export class institutional_courses extends Model<InferAttributes<institutional_courses>, InferCreationAttributes<institutional_courses>> {
    declare institutional_course_id: CreationOptional<number>;
    declare institutional_id: number;
    declare course_id: number;
    declare year: number;
    declare special_category: Enumerator;
    declare status: Enumerator;
    declare created_by: number;
    declare created_at: Date;
    declare updated_by: number;
    declare updated_at: Date;
    
}

institutional_courses.init({
    institutional_course_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    institutional_id: {
        type: DataTypes.INTEGER
    },
    course_id: {
        type: DataTypes.INTEGER
    },
    year: {
        type: DataTypes.INTEGER
    },
    special_category: {
        type: DataTypes.ENUM(...Object.values(constents.special_category_flages.list))
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
        tableName: 'institutional_courses',
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at',
    }

);