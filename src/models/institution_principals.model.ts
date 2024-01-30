import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, or } from 'sequelize';
import db from '../utils/dbconnection.util';
import { constents } from '../configs/constents.config';
import { institutions } from './institutions.model';


export class institution_principals extends Model<InferAttributes<institution_principals>, InferCreationAttributes<institution_principals>> {
    declare institution_principal_id: CreationOptional<number>;
    declare institution_id : number;
    declare principal_name: string;
    declare principal_name_vernacular: string;
    declare principal_email: string;
    declare principal_mobile: string;
    declare ed_cell_coordinator_name: string;
    declare ed_cell_coordinator_name_vernacular: string;
    declare ed_cell_coordinator_email: string;
    declare ed_cell_coordinator_mobile: string;
    declare status: Enumerator;
    declare created_by: number;
    declare created_at: Date;
    declare updated_by: number;
    declare updated_at: Date;
    
}

institution_principals.init({
    institution_principal_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    institution_id: {
        type: DataTypes.INTEGER
    },
    principal_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    principal_name_vernacular: {
        type: DataTypes.STRING
    },
    principal_email: {
        type: DataTypes.STRING
    },
    principal_mobile: {
        type: DataTypes.STRING
    },
    ed_cell_coordinator_name: {
        type: DataTypes.STRING
    },
    ed_cell_coordinator_name_vernacular: {
        type: DataTypes.STRING
    },
    ed_cell_coordinator_email: {
        type: DataTypes.STRING
    },
    ed_cell_coordinator_mobile: {
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
        tableName: 'institution_principals',
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at',
    }

);
institution_principals.belongsTo(institutions, {targetKey: 'institution_id',foreignKey: 'institution_id', constraints: false });
institutions.hasOne(institution_principals, { sourceKey: 'institution_id', foreignKey: 'institution_id', constraints: false });