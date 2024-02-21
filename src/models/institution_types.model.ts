import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, or } from 'sequelize';
import db from '../utils/dbconnection.util';
import { constents } from '../configs/constents.config';
import { institutional_courses } from './institutional_courses.model';


export class institution_types extends Model<InferAttributes<institution_types>, InferCreationAttributes<institution_types>> {
    declare institution_type_id: CreationOptional<number>;
    declare institution_short_name: String;
    declare institution_type: String;
    declare status: Enumerator;
    declare created_by: number;
    declare created_at: Date;
    declare updated_by: number;
    declare updated_at: Date;
    
}

institution_types.init({
    institution_type_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    institution_type: {
        type: DataTypes.STRING
    },
    institution_short_name: {
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
        tableName: 'institution_types',
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at',
    }

);
institution_types.belongsTo(institutional_courses, {targetKey: 'institution_type_id',foreignKey: 'institution_type_id', constraints: false });
institutional_courses.hasOne(institution_types, { sourceKey: 'institution_type_id', foreignKey: 'institution_type_id', constraints: false });