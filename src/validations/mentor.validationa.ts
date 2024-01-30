import Joi from 'joi';
import { constents } from '../configs/constents.config';
import { speeches } from '../configs/speeches.config';

export const mentorSchema = Joi.object().keys({
    username: Joi.string().trim().min(1).required().messages({
        'string.empty': speeches.USER_USERNAME_REQUIRED
    }),
    mentor_name: Joi.string().trim().min(1).required().messages({
        'string.empty': speeches.USER_FULLNAME_REQUIRED
    }),
    role: Joi.string().required().messages({
        'string.empty': speeches.USER_ROLE_REQUIRED
    })
});

export const mentorLoginSchema = Joi.object().keys({
    username: Joi.string().required().messages({
        'string.empty': speeches.USER_USERNAME_REQUIRED
    }),
    password: Joi.string().required().messages({
        'string.empty': speeches.USER_PASSWORD_REQUIRED
    })
});
export const mentorChangePasswordSchema = Joi.object().keys({
    user_id: Joi.string().required().messages({
        'string.empty': speeches.USER_USERID_REQUIRED
    }),
    old_password: Joi.string().required().messages({
        'string.empty': speeches.USER_OLDPASSWORD_REQUIRED
    }),
    new_password: Joi.string().trim().min(1).required().messages({
        'string.empty': speeches.USER_NEWPASSWORD_REQUIRED
    })
});

export const mentorUpdateSchema = Joi.object().keys({
    status: Joi.string().valid(...Object.values(constents.common_status_flags.list)),
    username: Joi.string().trim().min(1).required().email().messages({
        'string.empty': speeches.USER_USERNAME_REQUIRED
    }),
    mentor_email: Joi.string().trim().min(1).required().email(),
    mentor_mobile: Joi.string().trim().regex(constents.ONLY_DIGIT_PATTERN),
    mentor_name: Joi.string().trim().min(1).regex(constents.ALPHA_NUMERIC_PATTERN).required().messages({
        'string.empty': speeches.USER_FULLNAME_REQUIRED
    }),
    date_of_birth: Joi.string().trim().min(1).regex(constents.ALPHA_NUMERIC_PATTERN),
    mentor_name_vernacular: Joi.any(),
    mentor_title: Joi.string().regex(constents.ALPHA_NUMERIC_PATTERN),
    gender: Joi.string().regex(constents.ALPHA_NUMERIC_PATTERN),
    mentor_whatapp_mobile: Joi.string().max(10).regex(constents.ONLY_DIGIT_PATTERN)
});
export const mentorRegSchema = Joi.object().keys({
    status: Joi.string().valid(...Object.values(constents.common_status_flags.list)),
    username: Joi.string().trim().min(1).required().messages({
        'string.empty': speeches.USER_USERNAME_REQUIRED
    }),
    institution_code: Joi.string().required().messages({
        'string.empty': speeches.USER_ORGANIZATION_CODE_REQUIRED
    }),
    mentor_email: Joi.string().trim().min(1).required().email(),
    mentor_mobile: Joi.string().trim().regex(constents.ONLY_DIGIT_PATTERN),
    mentor_name: Joi.string().trim().min(1).regex(constents.ALPHA_NUMERIC_PATTERN).required().messages({
        'string.empty': speeches.USER_FULLNAME_REQUIRED
    }),
    date_of_birth: Joi.date(),
    mentor_name_vernacular: Joi.any(),
    mentor_title: Joi.string().regex(constents.ALPHA_NUMERIC_PATTERN),
    gender: Joi.string().regex(constents.ALPHA_NUMERIC_PATTERN),
    mentor_whatapp_mobile: Joi.string().max(10).regex(constents.ONLY_DIGIT_PATTERN),
    role: Joi.string().required().regex(constents.ALPHA_NUMERIC_PATTERN).messages({
        'string.empty': speeches.USER_ROLE_REQUIRED
    }),
    password:Joi.string(),
    institution_id:Joi.any(),
});