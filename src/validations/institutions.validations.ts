import Joi from 'joi';
import { constents } from '../configs/constents.config';
import { speeches } from '../configs/speeches.config';

export const institutionsSchema = Joi.object().keys({
    institution_code: Joi.string().required().messages({
        'string.empty': speeches.ID_REQUIRED
    }),
    institution_name: Joi.string().trim().min(1).required().messages({
        'string.empty': speeches.ID_REQUIRED
    }),
});

export const institutionsRawSchema = Joi.object().keys({
    institution_code: Joi.string().trim().min(1).required().messages({
        'string.empty': speeches.ORG_CODE_REQUIRED
    }),
    institution_name: Joi.string().trim().min(1).required().regex(constents.ALPHA_NUMERIC_PATTERN).messages({
        'string.empty': speeches.ORG_NAME_REQUIRED
    }),
    institution_type_id: Joi.number().required().messages({
        'string.empty': speeches.CATEGORY_REQ
    }),
    place_id: Joi.number().required().messages({
        'string.empty': speeches.STATE_REQ
    }),
    institution_name_vernacular: Joi.any(),
    status: Joi.string().valid(...Object.values(constents.institutions_status_flags.list))
});

export const institutionsUpdateSchema = Joi.object().keys({
    status: Joi.string().valid(...Object.values(constents.institutions_status_flags.list)).required().messages({
        'any.only': speeches.COMMON_STATUS_INVALID,
        'string.empty': speeches.COMMON_STATUS_REQUIRED
    }),
    institution_code: Joi.string().trim().min(1).required().messages({
        'string.empty': speeches.ORG_CODE_REQUIRED
    }),
    institution_name: Joi.string().trim().min(1).required().regex(constents.ALPHA_NUMERIC_PATTERN).messages({
        'string.empty': speeches.ORG_NAME_REQUIRED
    }),
    institution_type_id: Joi.number().required().messages({
        'string.empty': speeches.CATEGORY_REQ
    }),
    place_id: Joi.number().required().messages({
        'string.empty': speeches.STATE_REQ
    }),
    institution_name_vernacular: Joi.any()
});
export const institutionsCheckSchema = Joi.object().keys({
    institution_code: Joi.string().required().messages({
        'string.empty': speeches.ORG_CODE_REQUIRED
    }),
});