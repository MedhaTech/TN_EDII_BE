import { notFound, unauthorized } from "boom";
import { NextFunction, Request, Response } from "express";
import { speeches } from "../configs/speeches.config";
import dispatcher from "../utils/dispatch.util";
import ValidationsHolder from "../validations/validationHolder";
import BaseController from "./base.controller";
import authService from "../services/auth.service";
import validationMiddleware from "../middlewares/validation.middleware";
import { Op, QueryTypes, Sequelize } from "sequelize";
import { constents } from "../configs/constents.config";
import { institutionsCheckSchema, institutionsRawSchema, institutionsSchema, institutionsUpdateSchema } from "../validations/institutions.validations";
import { places } from "../models/places.model";
import { blocks } from "../models/blocks.model";
import { taluks } from "../models/taluks.model";
import { districts } from "../models/districts.model";
import { states } from "../models/states.model";
import { institution_types } from "../models/institution_types.model";
import { institution_principals } from "../models/institution_principals.model";
import db from "../utils/dbconnection.util"
import { institutions } from "../models/institutions.model";

export default class institutionsController extends BaseController {

    model = "institutions";
    authService: authService = new authService;

    protected initializePath(): void {
        this.path = '/institutions';
    }
    protected initializeValidations(): void {
        this.validations = new ValidationsHolder(institutionsSchema, institutionsUpdateSchema);
    }
    protected initializeRoutes(): void {
        this.router.post(`${this.path}/checkOrg`, validationMiddleware(institutionsCheckSchema), this.checkOrgDetails.bind(this));
        this.router.post(`${this.path}/createOrg`, validationMiddleware(institutionsRawSchema), this.createOrg.bind(this));
        this.router.get(`${this.path}/Streams`, this.getStreams.bind(this));
        this.router.get(`${this.path}/institutionTypes`, this.getInstitutionTypes.bind(this));
        this.router.get(`${this.path}/programs`, this.getPrograms.bind(this));
        this.router.post(`${this.path}/login`, this.login.bind(this));
        this.router.get(`${this.path}/logout`, this.logout.bind(this));
        this.router.put(`${this.path}/changePassword`, this.changePassword.bind(this));
        this.router.get(`${this.path}/Myprofile`, this.getMyprofile.bind(this));

        super.initializeRoutes();
    };
    protected async getData(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN') {
            return res.status(401).send(dispatcher(res, '', 'error', speeches.ROLE_ACCES_DECLINE, 401));
        }
        try {
            let data: any;
            const { model, id } = req.params;
            let newREQQuery: any = {}
            if (req.query.Data) {
                let newQuery: any = await this.authService.decryptGlobal(req.query.Data);
                newREQQuery = JSON.parse(newQuery);
            } else if (Object.keys(req.query).length !== 0) {
                return res.status(400).send(dispatcher(res, '', 'error', 'Bad Request', 400));
            }
            const paramStatus: any = newREQQuery.status;
            if (model) {
                this.model = model;
            };
            // pagination
            const { page, size, status } = newREQQuery;
            const { limit, offset } = this.getPagination(page, size);
            const modelClass = await this.loadModel(model).catch(error => {
                next(error)
            });
            const where: any = {};
            let whereClauseStatusPart: any = {};
            let whereClauseStatusPartLiteral = "1=1";
            let addWhereClauseStatusPart = false
            if (paramStatus && (paramStatus in constents.institutions_status_flags.list)) {
                if (paramStatus === 'ALL') {
                    whereClauseStatusPart = {};
                    addWhereClauseStatusPart = false;
                } else {
                    whereClauseStatusPart = { "status": paramStatus };
                    whereClauseStatusPartLiteral = `status = "${paramStatus}"`
                    addWhereClauseStatusPart = true;
                }
            } else if (paramStatus === 'NOTACTIVE') {
                whereClauseStatusPart = { status: { [Op.in]: ['INACTIVE', 'NEW'] } }
            } else {
                whereClauseStatusPart = { "status": ['ACTIVE', 'NEW'] };
                whereClauseStatusPartLiteral = `status = "ACTIVE"`
                addWhereClauseStatusPart = true;
            };
            if (id) {
                const newParamId = await this.authService.decryptGlobal(req.params.id);
                where[`${this.model}_id`] = newParamId;
                data = await this.crudService.findOne(modelClass, {
                    where: {
                        [Op.and]: [
                            whereClauseStatusPart,
                            where
                        ]
                    }
                });
            } else {
                try {
                    const responseOfFindAndCountAll = await this.crudService.findAndCountAll(modelClass, {
                        attributes: [
                            "institution_id",
                            "institution_code",
                            "institution_name",
                            "institution_name_vernacular"
                        ],
                        include: [
                            {
                                model: places,
                                attributes: [
                                    'place_id',
                                    'place_type',
                                    'place_name',
                                    'place_name_vernacular'
                                ],
                                include: {
                                    model: blocks,
                                    attributes: [
                                        'block_id',
                                        'block_name',
                                        'block_name_vernacular'
                                    ],
                                    include: {
                                        model: taluks,
                                        attributes: [
                                            'taluk_id',
                                            'taluk_name',
                                            'taluk_name_vernacular'
                                        ],
                                        include: {
                                            model: districts,
                                            attributes: [
                                                'district_id',
                                                'district_name',
                                                'district_name_vernacular',
                                                'district_headquarters',
                                                'district_headquarters_vernacular'
                                            ],
                                            include: {
                                                model: states,
                                                attributes: [
                                                    'state_id',
                                                    'state_name',
                                                    'state_name_vernacular'
                                                ]
                                            }
                                        }
                                    }
                                }
                            },
                            {
                                model: institution_types,
                                attributes: [
                                    'institution_type_id',
                                    'institution_type'
                                ]
                            },
                            {
                                model: institution_principals,
                                attributes: [
                                    'institution_principal_id',
                                    'principal_name',
                                    'principal_name_vernacular',
                                    'principal_email',
                                    'principal_mobile',
                                    'ed_cell_coordinator_name',
                                    'ed_cell_coordinator_name_vernacular',
                                    'ed_cell_coordinator_email',
                                    'ed_cell_coordinator_mobile'
                                ]
                            }
                        ],
                        where: {
                            [Op.and]: [
                                whereClauseStatusPart
                            ]
                        },
                        limit, offset
                    })
                    const result = this.getPagingData(responseOfFindAndCountAll, page, limit);
                    data = result;
                } catch (error: any) {
                    next(error)
                }
            }
            if (!data || data instanceof Error) {
                if (data != null) {
                    throw notFound(data.message)
                } else {
                    throw notFound()
                }
            }
            return res.status(200).send(dispatcher(res, data, 'success'));
        } catch (error) {
            console.log(error)
            next(error);
        }
    }
    private async checkOrgDetails(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const org = await this.authService.checkOrgDetails(req.body.institution_code);
        if (!org) {
            res.status(400).send(dispatcher(res, null, 'error', speeches.BAD_REQUEST))
        } else {
            res.status(200).send(dispatcher(res, org, 'success', speeches.FETCH_FILE));
        }
    }
    private async createOrg(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        return this.createData(req, res, next);
    }
    // private async getStreams(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    //     try {
    //         let response: any = [];
    //         const deValue: any = await this.authService.decryptGlobal(req.params.institution_type_id);
    //         const findUniversity = await this.crudService.findOne(institution_types, {
    //             where: { institution_type_id: JSON.parse(deValue) }
    //         })
    //         if (!findUniversity) {
    //             return res.status(404).send(dispatcher(res, null, 'error', 'no data found'));
    //         }
    //         let objWhereClauseStatusPart = this.getWhereClauseStatsPart(req);
    //         let result: any = {};
    //         const where: any = {};
    //         if (!findUniversity?.dataValues?.institution_type?.includes("University")) {
    //             where[`institution_type_id`] = JSON.parse(deValue);
    //             result = await this.crudService.findAll(streams, {
    //                 attributes: [
    //                     'stream_name',
    //                     "stream_id"
    //                 ],
    //                 where: {
    //                     [Op.and]: [
    //                         objWhereClauseStatusPart.whereClauseStatusPart,
    //                         where
    //                     ]
    //                 },
    //                 order: ['stream_name']
    //             });
    //             //result = await db.query(`SELECT stream_name,stream_id FROM unisolve_db.streams where institution_type_id = ${deValue} group by stream_name;`, { type: QueryTypes.SELECT });
    //         } else {
    //             result = await this.crudService.findAll(streams, {
    //                 attributes: [
    //                     'stream_name',
    //                     'stream_id'
    //                 ],
    //                 where: {
    //                     [Op.and]: [
    //                         objWhereClauseStatusPart.whereClauseStatusPart
    //                     ]
    //                 },
    //                 order: ['stream_name']
    //             });
    //             //result = await db.query(`SELECT stream_name,stream_id FROM unisolve_db.streams group by stream_name;`, { type: QueryTypes.SELECT });
    //         }
    //         if (result.length > 0) {
    //             result.forEach((obj: any) => {
    //                 response.push({ stream_name: obj.dataValues.stream_name, stream_id: obj.dataValues.stream_id })
    //             });
    //             return res.status(200).send(dispatcher(res, response, 'success'));
    //         }
    //         // result = await db.query(`SELECT stream_name,stream_id FROM unisolve_db.streams;`, { type: QueryTypes.SELECT });
    //         //return res.status(200).send(dispatcher(res, result, 'success'));
    //         return res.status(404).send(dispatcher(res, null, 'error', 'no data'));
    //     } catch (error) {
    //         next(error);
    //     }
    // }
    private async login(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const result = await this.authService.orglogin(req.body);
            if (!result) {
                return res.status(404).send(dispatcher(res, result, 'error', speeches.USER_NOT_FOUND));
            }
            else if (result.error) {
                return res.status(403).send(dispatcher(res, result, 'error'));
            }
            else {
                return res.status(200).send(dispatcher(res, result.data, 'success', speeches.USER_LOGIN_SUCCESS));
            }
        } catch (error) {
            return res.status(401).send(dispatcher(res, error, 'error', speeches.USER_RISTRICTED, 401));
        }
    }
    private async changePassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const result = await this.authService.orgchangePassword(req.body, res);
        if (!result) {
            return res.status(404).send(dispatcher(res, null, 'error', speeches.USER_NOT_FOUND));
        } else if (result.error) {
            return res.status(404).send(dispatcher(res, result.error, 'error', result.error));
        }
        else if (result.match) {
            return res.status(404).send(dispatcher(res, null, 'error', speeches.USER_PASSWORD));
        } else {
            return res.status(202).send(dispatcher(res, result.data, 'accepted', speeches.USER_PASSWORD_CHANGE, 202));
        }
    }

    private async logout(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const result = await this.authService.orglogout(req.body, res);
        if (result.error) {
            next(result.error);
        } else {
            return res.status(200).send(dispatcher(res, speeches.LOGOUT_SUCCESS, 'success'));
        }
    }
    private async getInstitutionTypes(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {

            let newREQQuery: any = {}
            if (req.query.Data) {
                let newQuery: any = await this.authService.decryptGlobal(req.query.Data);
                newREQQuery = JSON.parse(newQuery);
            } else if (Object.keys(req.query).length !== 0) {
                return res.status(400).send(dispatcher(res, '', 'error', 'Bad Request', 400));
            }
            const { institution_id } = newREQQuery
            const result = await db.query(`SELECT DISTINCT
            institution_type,it.institution_type_id
        FROM
            institutional_courses AS inC
                JOIN
            institution_types AS it ON inC.institution_type_id = it.institution_type_id
        WHERE
            institution_id = ${institution_id};`, { type: QueryTypes.SELECT })
            return res.status(200).send(dispatcher(res, result, 'success'));
        } catch (error) {
            next(error);
        }
    }
    private async getStreams(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {

            let newREQQuery: any = {}
            if (req.query.Data) {
                let newQuery: any = await this.authService.decryptGlobal(req.query.Data);
                newREQQuery = JSON.parse(newQuery);
            } else if (Object.keys(req.query).length !== 0) {
                return res.status(400).send(dispatcher(res, '', 'error', 'Bad Request', 400));
            }
            const { institution_id, institution_type_id } = newREQQuery
            const result = await db.query(`SELECT DISTINCT
            stream_name,s.stream_id
        FROM
            institutional_courses AS inC
                JOIN
            streams AS s ON inC.stream_id = s.stream_id
        WHERE
            institution_id = ${institution_id} and institution_type_id = ${institution_type_id};`, { type: QueryTypes.SELECT })
            return res.status(200).send(dispatcher(res, result, 'success'));
        } catch (error) {
            next(error);
        }
    }
    private async getPrograms(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {

            let newREQQuery: any = {}
            if (req.query.Data) {
                let newQuery: any = await this.authService.decryptGlobal(req.query.Data);
                newREQQuery = JSON.parse(newQuery);
            } else if (Object.keys(req.query).length !== 0) {
                return res.status(400).send(dispatcher(res, '', 'error', 'Bad Request', 400));
            }
            const { institution_id, institution_type_id, stream_id } = newREQQuery
            const result = await db.query(`SELECT DISTINCT
            program_name,institution_course_id
        FROM
            institutional_courses AS inC
                JOIN
            programs AS p ON inC.program_id = p.program_id
        WHERE
            institution_id = ${institution_id} and institution_type_id = ${institution_type_id} and stream_id = ${stream_id};`, { type: QueryTypes.SELECT })
            return res.status(200).send(dispatcher(res, result, 'success'));
        } catch (error) {
            next(error);
        }
    }
    private async getMyprofile(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'INSTITUTION') {
            return res.status(401).send(dispatcher(res, '', 'error', speeches.ROLE_ACCES_DECLINE, 401));
        }
        try {
            let newREQQuery: any = {}
            if (req.query.Data) {
                let newQuery: any = await this.authService.decryptGlobal(req.query.Data);
                newREQQuery = JSON.parse(newQuery);
            } else if (Object.keys(req.query).length !== 0) {
                return res.status(400).send(dispatcher(res, '', 'error', 'Bad Request', 400));
            }
            const { institution_id } = newREQQuery;
            if (!institution_id) {
                throw unauthorized(speeches.USER_INSTID_REQUIRED)
            }
            let result: any = {}
            const org = await this.crudService.findOne(institutions, {
                where: {
                    institution_id: institution_id
                },
                include: [
                    {
                        model: places,
                        attributes: [
                            'place_id',
                            'place_type',
                            'place_name',
                            'place_name_vernacular'
                        ],
                        include: {
                            model: taluks,
                            attributes: [
                                'taluk_id',
                                'taluk_name',
                                'taluk_name_vernacular'

                            ],
                            include: {
                                model: blocks,
                                attributes: [
                                    'block_id',
                                    'block_name',
                                    'block_name_vernacular'
                                ],
                                include: {
                                    model: districts,
                                    attributes: [
                                        'district_id',
                                        'district_name',
                                        'district_name_vernacular',
                                        'district_headquarters',
                                        'district_headquarters_vernacular'
                                    ],
                                    include: {
                                        model: states,
                                        attributes: [
                                            'state_id',
                                            'state_name',
                                            'state_name_vernacular'
                                        ]
                                    }
                                }
                            }
                        }
                    },
                    {
                        model: institution_principals,
                        attributes: [
                            'institution_principal_id',
                            'principal_name',
                            'principal_name_vernacular',
                            'principal_email',
                            'principal_mobile',
                            'ed_cell_coordinator_name',
                            'ed_cell_coordinator_name_vernacular',
                            'ed_cell_coordinator_email',
                            'ed_cell_coordinator_mobile'
                        ]
                    },
                ]
            });
            const listofcoures = await db.query(`SELECT 
        institution_course_id,
        special_category,
        institution_type,
        institution_short_name,
        stream_name,
        stream_short_form,
        program_name,
        program_short_name,
        no_of_years,
        program_type
    FROM
        institutional_courses AS inct
            JOIN
        institution_types AS it ON inct.institution_type_id = it.institution_type_id
            JOIN
        streams AS st ON inct.stream_id = st.stream_id
            JOIN
        programs AS p ON inct.program_id = p.program_id
    WHERE
        institution_id = ${institution_id};`, { type: QueryTypes.SELECT })
            const telePhoneMsg = await db.query(`select url,on_off from popup where popup_id = 4`, { type: QueryTypes.SELECT });
            result['profile'] = org;
            result['courses_list'] = listofcoures;
            result['telePhoneMsg'] = telePhoneMsg;
            if (!org) {
                res.status(400).send(dispatcher(res, null, 'error', speeches.BAD_REQUEST))
            } else {
                res.status(200).send(dispatcher(res, result, 'success', speeches.FETCH_FILE));
            }
        }
        catch (error) {
            next(error);
        }

    }
}
