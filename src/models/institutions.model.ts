import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, or } from 'sequelize';
import db from '../utils/dbconnection.util';
import { constents } from '../configs/constents.config';


export class institutions extends Model<InferAttributes<institutions>, InferCreationAttributes<institutions>> {
    declare institution_id: CreationOptional<number>;
    declare institution_code: string;
    declare institution_name: string;
    declare institution_name_vernacular: string;
    declare institution_type_id: number;
    declare place_id : number;
    declare status: Enumerator;
    declare created_by: number;
    declare created_at: Date;
    declare updated_by: number;
    declare updated_at: Date;
    declare role:string;
}

institutions.init({
    institution_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    institution_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    institution_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    institution_name_vernacular: {
        type: DataTypes.STRING
    },
    institution_type_id: {
        type: DataTypes.INTEGER
    },
    place_id: {
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
    },
    role: {
        type: DataTypes.STRING
    },
},
    {
        sequelize: db,
        tableName: 'institutions',
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at',
    }
);