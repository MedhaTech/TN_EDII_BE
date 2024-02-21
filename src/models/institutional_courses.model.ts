import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, or } from 'sequelize';
import db from '../utils/dbconnection.util';
import { constents } from '../configs/constents.config';


export class institutional_courses extends Model<InferAttributes<institutional_courses>, InferCreationAttributes<institutional_courses>> {
    declare institution_course_id: CreationOptional<number>;
    declare institution_id: number;
    declare institution_type_id: number;
    declare stream_id : number;
    declare program_id : number;
    declare status: Enumerator;
    declare institutional_courses : number;
    declare created_by: number;
    declare created_at: Date;
    declare updated_by: number;
    declare updated_at: Date;
    
}

institutional_courses.init({
    institution_course_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    institution_id: {
        type: DataTypes.INTEGER
    },
    institution_type_id: {
        type: DataTypes.INTEGER
    },
    stream_id: {
        type: DataTypes.INTEGER
    },
    program_id: {
        type: DataTypes.INTEGER
    },
    status: {
        type: DataTypes.ENUM(...Object.values(constents.institutions_status_flags.list)),
        defaultValue: constents.institutions_status_flags.default
    },
    institutional_courses: {
        type: DataTypes.INTEGER
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