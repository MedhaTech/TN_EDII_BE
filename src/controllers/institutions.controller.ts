import { notFound } from "boom";
import { NextFunction, Request, Response } from "express";
import { speeches } from "../configs/speeches.config";
import dispatcher from "../utils/dispatch.util";
import ValidationsHolder from "../validations/validationHolder";
import BaseController from "./base.controller";
import authService from "../services/auth.service";
import validationMiddleware from "../middlewares/validation.middleware";
import { Op } from "sequelize";
import { constents } from "../configs/constents.config";
import { institutionsCheckSchema, institutionsRawSchema, institutionsSchema, institutionsUpdateSchema } from "../validations/institutions.validations";
import { places } from "../models/places.model";
import { blocks } from "../models/blocks.model";
import { taluks } from "../models/taluks.model";
import { districts } from "../models/districts.model";
import { states } from "../models/states.model";
import { institution_types } from "../models/institution_types.model";
import { institution_principals } from "../models/institution_principals.model";

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

}
