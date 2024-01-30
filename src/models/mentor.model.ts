import { DataTypes, Model, Attributes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import bcrypt from 'bcrypt';
import { constents } from '../configs/constents.config';
import db from '../utils/dbconnection.util';
import { notification } from './notification.model';
import { baseConfig } from '../configs/base.config';
import { user } from './user.model';
import { organization } from './organization.model';
import { student } from './student.model';
import { institutions } from './institutions.model';


export class mentor extends Model<InferAttributes<mentor>, InferCreationAttributes<mentor>> {
    declare mentor_id: CreationOptional<number>;
    declare financial_year_id: number;
    declare user_id: number;
    declare institution_id: number;
    declare mentor_title: string;
    declare mentor_name: string;
    declare mentor_name_vernacular: string;
    declare mentor_mobile: string;
    declare mentor_whatapp_mobile: string;
    declare mentor_email: string;
    declare date_of_birth: Date;
    declare gender: string;
    declare otp: string;
    declare reg_status: number;
    declare status: Enumerator;
    declare created_by: number;
    declare created_at: Date;
    declare updated_by: number;
    declare updated_at: Date;
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models: any) {
        // define association here
        mentor.hasMany(notification, { sourceKey: 'notification_id', as: 'notifications' });
    }
}

mentor.init(
    {
        mentor_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        financial_year_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        institution_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        mentor_title: {
            type:DataTypes.STRING,
            allowNull: false
        },
        mentor_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        mentor_name_vernacular: {
            type: DataTypes.STRING,
        },
        mentor_mobile: {
            type: DataTypes.STRING,
            unique: true
        },
        mentor_whatapp_mobile:{
            type:DataTypes.STRING,
        },
        mentor_email:{
            type:DataTypes.STRING,
        },
        date_of_birth: {
            type: DataTypes.DATE,
            allowNull: true
        },
        gender:{
            type:DataTypes.STRING,
            allowNull: false
        },
        otp: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        reg_status: {
            type: DataTypes.ENUM(...Object.values(constents.res_status.list)),
            defaultValue: constents.res_status.default,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM(...Object.values(constents.common_status_flags.list)),
            defaultValue: constents.common_status_flags.default
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
       
    },
    {
        sequelize: db,
        tableName: 'mentors',
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at',
        hooks: {
            beforeCreate: async (user: any) => {
                if (user.password) {
                    user.password = await bcrypt.hashSync(user.password, process.env.SALT || baseConfig.SALT);
                }
            },
            beforeUpdate: async (user) => {
                if (user.password) {
                    user.password = await bcrypt.hashSync(user.password, process.env.SALT || baseConfig.SALT);
                }
            }
        }
    }
);

mentor.belongsTo(user, { foreignKey: 'user_id', constraints: false, scope: { role: 'MENTOR' } });
user.hasOne(mentor, { foreignKey: 'user_id', constraints: false });
// mentor.belongsTo(organization, { targetKey: 'organization_code', foreignKey: 'organization_code', constraints: false });
// organization.hasOne(mentor, { sourceKey: 'organization_code', foreignKey: 'organization_code', constraints: false });
mentor.belongsTo(student, { targetKey: 'team_id', foreignKey: 'institution_id', constraints: false });
student.hasOne(mentor, { sourceKey: 'team_id', foreignKey: 'institution_id', constraints: false });
mentor.belongsTo(institutions, {targetKey: 'institution_id',foreignKey: 'institution_id', constraints: false });
institutions.hasOne(mentor, { sourceKey: 'institution_id', foreignKey: 'institution_id', constraints: false });