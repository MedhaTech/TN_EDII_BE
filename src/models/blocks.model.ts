import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, or } from 'sequelize';
import db from '../utils/dbconnection.util';
import { constents } from '../configs/constents.config';
import { taluks } from './taluks.model';


export class blocks extends Model<InferAttributes<blocks>, InferCreationAttributes<blocks>> {
    declare block_id: CreationOptional<number>;
    declare block_name: string;
    declare block_name_vernacular: string;
    declare district_id : number;
    declare status: Enumerator;
    declare created_by: number;
    declare created_at: Date;
    declare updated_by: number;
    declare updated_at: Date;
    
}

blocks.init({
    block_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    block_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    block_name_vernacular: {
        type: DataTypes.STRING
    },
    district_id: {
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
        tableName: 'blocks',
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at',
    }

);
blocks.belongsTo(taluks, {targetKey: 'block_id',foreignKey: 'block_id', constraints: false });
taluks.hasOne(blocks, { sourceKey: 'block_id', foreignKey: 'block_id', constraints: false });