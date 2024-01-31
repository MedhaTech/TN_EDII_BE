import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, or } from 'sequelize';
import db from '../utils/dbconnection.util';
import { constents } from '../configs/constents.config';


export class course_branches extends Model<InferAttributes<course_branches>, InferCreationAttributes<course_branches>> {
    declare course_branche_id: CreationOptional<number>;
    declare course_type_id: number;
    declare course_branche_name: String;
    declare course_category: Enumerator;
    declare status: Enumerator;
    declare created_by: number;
    declare created_at: Date;
    declare updated_by: number;
    declare updated_at: Date;
    
}

course_branches.init({
    course_branche_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    course_type_id: {
        type: DataTypes.INTEGER
    },
    course_branche_name: {
        type: DataTypes.STRING
    },
    course_category: {
        type: DataTypes.ENUM(...Object.values(constents.course_catrgory_flages.list))
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
        tableName: 'course_branches',
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at',
    }

);