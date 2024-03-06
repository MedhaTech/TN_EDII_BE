import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, or } from 'sequelize';
import db from '../utils/dbconnection.util';
import { constents } from '../configs/constents.config';
import { institutions } from './institutions.model';


export class places extends Model<InferAttributes<places>, InferCreationAttributes<places>> {
    declare place_id: CreationOptional<number>;
    declare place_type: Enumerator;
    declare place_name: string;
    declare place_name_vernacular: string;
    declare block_id : number;
    declare taluk_id : number;
    declare status: Enumerator;
    declare created_by: number;
    declare created_at: Date;
    declare updated_by: number;
    declare updated_at: Date;
    
}

places.init({
    place_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    place_type: {
        type: DataTypes.ENUM(...Object.values(constents.place_type_status_flags.list))
    },
    place_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    place_name_vernacular: {
        type: DataTypes.STRING
    },
    block_id: {
        type: DataTypes.INTEGER
    },
    taluk_id: {
        type: DataTypes.INTEGER
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
        tableName: 'places',
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at',
    }

);
places.belongsTo(institutions, {targetKey: 'place_id',foreignKey: 'place_id', constraints: false });
institutions.hasOne(places, { sourceKey: 'place_id', foreignKey: 'place_id', constraints: false });