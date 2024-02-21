import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, or } from 'sequelize';
import db from '../utils/dbconnection.util';
import { constents } from '../configs/constents.config';
import { institutional_courses } from './institutional_courses.model';


export class programs extends Model<InferAttributes<programs>, InferCreationAttributes<programs>> {
    declare program_id: CreationOptional<number>;
    declare program_name: String;
    declare program_short_name: String;
    declare no_of_years : number;
    declare program_type : Enumerator;
    declare status: Enumerator;
    declare created_by: number;
    declare created_at: Date;
    declare updated_by: number;
    declare updated_at: Date;
    declare sort_order: number;
    
}

programs.init({
    program_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    program_name: {
        type: DataTypes.STRING
    },
    program_short_name: {
        type: DataTypes.STRING
    },
    no_of_years: {
        type: DataTypes.INTEGER
    },
    program_type: {
        type: DataTypes.ENUM(...Object.values(constents.program_type_flags.list))
    },
    status: {
        type: DataTypes.ENUM(...Object.values(constents.institutions_status_flags.list)),
        defaultValue: constents.institutions_status_flags.default
    },
    sort_order: {
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
        tableName: 'programs',
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at',
    }

);
programs.belongsTo(institutional_courses, {targetKey: 'program_id',foreignKey: 'program_id', constraints: false });
institutional_courses.hasOne(programs, { sourceKey: 'program_id', foreignKey: 'program_id', constraints: false });