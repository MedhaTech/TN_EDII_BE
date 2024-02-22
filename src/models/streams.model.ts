import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, or } from 'sequelize';
import db from '../utils/dbconnection.util';
import { constents } from '../configs/constents.config';
import { institutional_courses } from './institutional_courses.model';


export class streams extends Model<InferAttributes<streams>, InferCreationAttributes<streams>> {
    declare stream_id: CreationOptional<number>;
    declare stream_name: string;
    declare stream_short_form: string;
    declare status: Enumerator;
    declare created_by: number;
    declare created_at: Date;
    declare updated_by: number;
    declare updated_at: Date;
    declare sort_order: number;
    
}

streams.init({
    stream_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    stream_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    stream_short_form: {
        type: DataTypes.STRING,
        allowNull: false
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
        tableName: 'streams',
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at',
    }
);
streams.belongsTo(institutional_courses, {targetKey: 'stream_id',foreignKey: 'stream_id', constraints: false });
institutional_courses.hasOne(streams, { sourceKey: 'stream_id', foreignKey: 'stream_id', constraints: false });