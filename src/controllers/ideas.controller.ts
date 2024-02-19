
import { NextFunction, Request, Response } from "express";;
import BaseController from "./base.controller";
import dispatcher from "../utils/dispatch.util";
import { speeches } from "../configs/speeches.config";
import { badRequest, notFound, unauthorized } from "boom";
import { ideas } from "../models/ideas.model";
import { themes_problems } from "../models/themes_problems.model";
import { Op, QueryTypes } from "sequelize";
import fs from 'fs';
import { S3 } from "aws-sdk";
import { HttpsProxyAgent } from "https-proxy-agent";
import db from "../utils/dbconnection.util";
import { evaluation_process } from "../models/evaluation_process.model";
import { constents } from "../configs/constents.config";

export default class ideasController extends BaseController {

    model = "ideas";

    protected initializePath(): void {
        this.path = '/ideas';
    }
    protected initializeRoutes(): void {
        this.router.post(this.path + "/test", this.initiateIdeaop.bind(this));
        this.router.post(this.path + "/initiate", this.initiateIdea.bind(this));
        this.router.put(this.path + "/ideaUpdate", this.UpdateIdea.bind(this));
        this.router.get(this.path + '/submittedDetails', this.getResponse.bind(this));
        this.router.post(this.path + "/fileUpload", this.handleAttachment.bind(this));
        this.router.get(`${this.path}/ideastatusbyteamId`, this.getideastatusbyteamid.bind(this));
        this.router.get(this.path + '/fetchRandomChallenge', this.getRandomChallenge.bind(this));
        super.initializeRoutes();
    }
    protected async initiateIdeaop(req: Request, res: Response, next: NextFunction) {
        // if(res.locals.role !== 'ADMIN' && res.locals.role !== 'STUDENT' ){
        //     return res.status(401).send(dispatcher(res,'','error', speeches.ROLE_ACCES_DECLINE,401));
        // }
        try {
            const attachmentsCopyResult = await this.copyAllFiles(req, null, "ideas", "test");
            console.log(attachmentsCopyResult.attachments);
            res.status(200).send(dispatcher(res, attachmentsCopyResult))
        } catch (err) {
            next(err)
        }
    }
    protected async initiateIdea(req: Request, res: Response, next: NextFunction) {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'STUDENT') {
            return res.status(401).send(dispatcher(res, '', 'error', speeches.ROLE_ACCES_DECLINE, 401));
        }
        try {
            const { team_id } = req.body;
            if (!team_id) {
                throw unauthorized(speeches.USER_TEAMID_REQUIRED)
            }
            req.body['financial_year_id'] = 1;
            let result: any = await this.crudService.create(ideas, req.body);
            if (!result) {
                throw badRequest(speeches.INVALID_DATA);
            }
            if (result instanceof Error) {
                throw result;
            }
            res.status(200).send(dispatcher(res, result))
        } catch (err) {
            next(err)
        }
    }
    protected async UpdateIdea(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'STUDENT' && res.locals.role !== 'MENTOR') {
            return res.status(401).send(dispatcher(res, '', 'error', speeches.ROLE_ACCES_DECLINE, 401));
        }
        try {
            const { team_id, problem_statement_id, status, initiated_by } = req.body;
            if (!team_id) {
                throw unauthorized(speeches.USER_TEAMID_REQUIRED)
            }
            var dataBodyforThemes = { ...req.body };
            dataBodyforThemes['status'] = 'MANUAL'
            if (problem_statement_id) {
                if (problem_statement_id === 0 || problem_statement_id === '0') {
                    let result: any = await this.crudService.create(themes_problems, dataBodyforThemes);
                    req.body['theme_problem_id'] = result.dataValues.theme_problem_id;
                } else {
                    const where: any = {};
                    where[`theme_problem_id`] = problem_statement_id;
                    where[`status`] = 'MANUAL';
                    const finsThemeStatus: any = await this.crudService.findOne(themes_problems, { where: { 'theme_problem_id': problem_statement_id } })

                    if (finsThemeStatus.dataValues.status === 'MANUAL') {
                        let result: any = await this.crudService.update(themes_problems, dataBodyforThemes, { where: where });
                    }
                    req.body['theme_problem_id'] = problem_statement_id;
                }
            }
            if (initiated_by) {
                req.body['financial_year_id'] = 1;
            }
            if (status) {
                if (status === 'DRAFT') {
                    req.body['submitted_at'] = null;
                } else {
                    let newDate = new Date();
                    let newFormat = (newDate.getFullYear()) + "-" + (1 + newDate.getMonth()) + "-" + newDate.getUTCDate() + ' ' + newDate.getHours() + ':' + newDate.getMinutes() + ':' + newDate.getSeconds();
                    req.body['submitted_at'] = newFormat;
                }
            }
            const where: any = {};
            const valuebody = req.body;
            where[`team_id`] = team_id;
            let result: any = await this.crudService.update(ideas, valuebody, { where: where });
            return res.status(200).send(dispatcher(res, result, 'updated'));
        } catch (err) {
            next(err)
        }
    }
    protected async getResponse(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'STUDENT' && res.locals.role !== 'MENTOR' && res.locals.role !== 'STATE' && res.locals.role !== 'INSTITUTION') {
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
            let { team_id } = newREQQuery;
            if (!team_id) {
                throw unauthorized(speeches.USER_TEAMID_REQUIRED)
            }
            let data: any;
            const { id } = req.params;

            let condition: any = {};
            if (team_id) {
                condition.team_id = team_id
            }
            data = await this.crudService.findOne(ideas, {
                attributes: [
                    [
                        db.literal(`(SELECT full_name FROM users As s WHERE s.user_id = \`ideas\`.\`initiated_by\` )`), 'initiated_name'
                    ],
                    [
                        db.literal(`(SELECT full_name FROM users As s WHERE s.user_id = \`ideas\`.\`verified_by\` )`), 'verified_name'
                    ],
                    "idea_id",
                    "financial_year_id",
                    "theme_problem_id",
                    "team_id",
                    "idea_title",
                    "solution_statement",
                    "detailed_solution",
                    "prototype_available",
                    "Prototype_file",
                    "idea_available",
                    "self_declaration",
                    "status",
                    "initiated_by",
                    "submitted_at",
                    "created_by",
                    "created_at",
                    "verified_by",
                    "verified_at",
                    "evaluated_by",
                    "evaluated_at",
                    "evaluation_status",
                    "rejected_reason",
                    "final_result",
                    "district"],
                where: {
                    [Op.and]: [
                        condition
                    ]
                },
                include: {
                    model: themes_problems,
                    attributes: [
                        "theme_problem_id",
                        "theme_name",
                        "problem_statement",
                        "problem_statement_description",
                        "status"
                    ]
                }
            })
            return res.status(200).send(dispatcher(res, data, 'success'));
        } catch (error) {
            next(error);
        }
    }
    protected async handleAttachment(req: Request, res: Response, next: NextFunction) {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'STUDENT') {
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
            const { team_id } = newREQQuery;
            const rawfiles: any = req.files;
            const files: any = Object.values(rawfiles);
            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'application/msword',
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            ];
            if (!allowedTypes.includes(files[0].type)) {
                return res.status(400).send(dispatcher(res, '', 'error', 'This file type not allowed', 400));
            }
            const errs: any = [];
            let attachments: any = [];
            let result: any = {};
            let proxyAgent = new HttpsProxyAgent('http://10.236.241.101:9191');
            let s3 = new S3({
                apiVersion: '2006-03-01',
                region: process.env.AWS_REGION,
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                httpOptions: { agent: proxyAgent }
            });
            if (!req.files) {
                return result;
            }
            let file_name_prefix: any;
            if (process.env.DB_HOST?.includes("stage")) {
                file_name_prefix = `ideas/stage/${team_id}`
            } else if (process.env.DB_HOST?.includes("dev")) {
                file_name_prefix = `ideas/dev/${team_id}`
            } else {
                file_name_prefix = `ideas/prod/${team_id}`
            }
            for (const file_name of Object.keys(files)) {
                const file = files[file_name];
                const readFile: any = await fs.readFileSync(file.path);
                if (readFile instanceof Error) {
                    errs.push(`Error uploading file: ${file.originalFilename} err: ${readFile}`)
                }
                file.originalFilename = `${file_name_prefix}/${file.originalFilename}`;
                let params = {
                    Bucket: `${process.env.BUCKET}`,
                    Key: file.originalFilename,
                    Body: readFile
                };
                let options: any = { partSize: 20 * 1024 * 1024, queueSize: 2 };
                await s3.upload(params, options).promise()
                    .then((data: any) => { attachments.push(data.Location) })
                    .catch((err: any) => { errs.push(`Error uploading file: ${file.originalFilename}, err: ${err.message}`) })
                result['attachments'] = attachments;
                result['errors'] = errs;
            }
            res.status(200).send(dispatcher(res, result));
        } catch (err) {
            next(err)
        }
    }
    protected async getideastatusbyteamid(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'MENTOR') {
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
            const teamId = newREQQuery.team_id;
            const result = await db.query(`select  ifnull((select status  FROM ideas where team_id = ${teamId}),'No Idea')ideaStatus`, { type: QueryTypes.SELECT });
            res.status(200).send(dispatcher(res, result, "success"))
        } catch (error) {
            next(error);
        }
    }
    protected async getRandomChallenge(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if(res.locals.role !== 'ADMIN' && res.locals.role !== 'EVALUATOR'){
            return res.status(401).send(dispatcher(res,'','error', speeches.ROLE_ACCES_DECLINE,401));
        }
        try {
            let challengeResponse: any;
            let evaluator_id: any;
            let whereClause: any = {};
            let whereClauseStatusPart: any = {}
            let attributesNeedFetch: any;
            let newREQQuery : any = {}
            if(req.query.Data){
                let newQuery : any = await this.authService.decryptGlobal(req.query.Data);
                newREQQuery  = JSON.parse(newQuery);
            }else if(Object.keys(req.query).length !== 0){
                return res.status(400).send(dispatcher(res,'','error','Bad Request',400));
            }

            let user_id = res.locals.user_id;
            if (!user_id) throw unauthorized(speeches.UNAUTHORIZED_ACCESS);

            let evaluator_user_id = newREQQuery.evaluator_user_id;
            if (!evaluator_user_id) throw unauthorized(speeches.ID_REQUIRED);

            let activeDistrict = await this.crudService.findOne(evaluation_process, {
                attributes: ['district'], where: { [Op.and]: [{ status: 'ACTIVE' }, { level_name: 'L1' }] }
            });
            let districts = activeDistrict.dataValues.district;
            const convertToDistrictArray = districts.split(",");
            const paramStatus: any = newREQQuery.status;
            let boolStatusWhereClauseRequired = false;

            if (paramStatus && (paramStatus in constents.challenges_flags.list)) {
                whereClauseStatusPart = { "status": paramStatus ,district : {[Op.in]: convertToDistrictArray} };
                boolStatusWhereClauseRequired = true;
            } else {
                whereClauseStatusPart = { "status": "SUBMITTED",district : {[Op.in]: convertToDistrictArray} };
                boolStatusWhereClauseRequired = true;
            };

            evaluator_id = { evaluated_by: evaluator_user_id }

            let level = newREQQuery.level;
            if (level && typeof level == 'string') {
                let districtsArray = districts.replace(/,/g, "','")
                switch (level) {
                    case 'L1':
                        attributesNeedFetch = [
                            "idea_id",
                            "financial_year_id",
                            "theme_problem_id",
                            "team_id",
                            "idea_title",
                            "solution_statement",
                            "detailed_solution",
                            "prototype_available",
                            "Prototype_file",
                            "idea_available",
                            "self_declaration",
                            "status",
                            "initiated_by",
                            "submitted_at",
                            "created_by",
                            "created_at",
                            "verified_by",
                            "verified_at",
                            "district",
                            [
                                db.literal(`( SELECT count(*) FROM ideas as idea where idea.verified_by <> 'null')`),
                                'overAllIdeas'
                            ],
                            [
                                db.literal(`(SELECT count(*) FROM ideas as idea where idea.evaluation_status is null AND idea.verified_by <> 'null' AND idea.district IN ('${districtsArray}'))`),
                                'openIdeas'
                            ],
                            [
                                db.literal(`(SELECT count(*) FROM ideas as idea where idea.evaluated_by = ${evaluator_user_id.toString()})`), 'evaluatedIdeas'
                            ],
                        ],
                            whereClause = {
                                [Op.and]: [
                                    whereClauseStatusPart,
                                    { evaluation_status: { [Op.is]: null } },
                                    { verified_by : { [Op.ne]: null } }

                                ]
                            }
                        challengeResponse = await this.crudService.findOne(ideas, {
                            attributes: attributesNeedFetch,
                            where: whereClause,
                            order: db.literal('rand()'), limit: 1
                        });
                        if (challengeResponse instanceof Error) {
                            throw challengeResponse
                        }
                        if (!challengeResponse) {
                            throw notFound("All ideas has been accepted, no more challenge to display");
                        };
                        break;
                    case 'L2':
                        let activeDistrict = await this.crudService.findOne(evaluation_process, {
                            attributes: ['district'], where: { [Op.and]: [{ status: 'ACTIVE' }, { level_name: 'L2' }] }
                        });
                        let districts = activeDistrict.dataValues.district;
                        if (districts !== null) {
                            let districtsArray = districts.replace(/,/g, "','")
                            challengeResponse = await db.query("SELECT ideas.idea_id, ideas.theme_problem_id, ideas.idea_title, ideas.team_id, ideas.solution_statement, ideas.detailed_solution, ideas.prototype_available, ideas.Prototype_file, ideas.idea_available, ideas.self_declaration, ideas.initiated_by, ideas.created_at, ideas.submitted_at, ideas.status, ideas.district, ideas.verified_by, (SELECT COUNT(*) FROM ideas AS idea WHERE idea.evaluation_status = 'SELECTEDROUND1') AS 'overAllIdeas', (SELECT COUNT(*) - SUM(CASE WHEN FIND_IN_SET('" + evaluator_user_id.toString() + "', evals) > 0 THEN 1 ELSE 0 END) FROM l1_accepted WHERE l1_accepted.district IN ('" + districtsArray + "')) AS 'openIdeas', (SELECT COUNT(*) FROM evaluator_ratings AS A WHERE A.evaluator_id = '" + evaluator_user_id.toString() + "') AS 'evaluatedIdeas' FROM l1_accepted AS l1_accepted LEFT OUTER JOIN ideas ON l1_accepted.idea_id = ideas.idea_id WHERE l1_accepted.district IN ('" + districtsArray + "') AND NOT FIND_IN_SET('" + evaluator_user_id.toString() + "', l1_accepted.evals) ORDER BY RAND() LIMIT 1", { type: QueryTypes.SELECT });
                        } else {
                            challengeResponse = await db.query(`SELECT ideas.idea_id, ideas.theme_problem_id, ideas.idea_title, ideas.team_id, ideas.solution_statement, ideas.detailed_solution, ideas.prototype_available, ideas.Prototype_file, ideas.idea_available, ideas.self_declaration, ideas.initiated_by, ideas.created_at, ideas.submitted_at, ideas.status, ideas.district, ideas.verified_by, (SELECT COUNT(*) FROM ideas AS idea WHERE idea.evaluation_status = 'SELECTEDROUND1') AS 'overAllIdeas', (SELECT COUNT(*) - SUM(CASE WHEN FIND_IN_SET(${evaluator_user_id.toString()}, evals) > 0 THEN 1 ELSE 0 END) FROM l1_accepted) AS 'openIdeas', (SELECT COUNT(*) FROM evaluator_ratings AS A WHERE A.evaluator_id = ${evaluator_user_id.toString()}) AS 'evaluatedIdeas' FROM l1_accepted AS l1_accepted LEFT OUTER JOIN ideas ON l1_accepted.idea_id = ideas.idea_id WHERE NOT FIND_IN_SET(${evaluator_user_id.toString()}, l1_accepted.evals) ORDER BY RAND() LIMIT 1`, { type: QueryTypes.SELECT });
                        }
                        const evaluatedIdeas = await db.query(`SELECT COUNT(*) as evaluatedIdeas FROM evaluator_ratings AS A WHERE A.evaluator_id = ${evaluator_user_id.toString()}`, { type: QueryTypes.SELECT })
                        let throwMessage = {
                            message: 'All ideas has been rated, no more challenge to display',
                            //@ts-ignore
                            evaluatedIdeas: evaluatedIdeas[0].evaluatedIdeas
                        };
                        if (challengeResponse instanceof Error) {
                            throw challengeResponse
                        }
                        if (challengeResponse.length == 0) {
                            // throw notFound("All challenge has been rated, no more challenge to display");
                            return res.status(200).send(dispatcher(res, throwMessage, 'success'));
                        };
                        break;
                    default:
                        break;
                }
            }
            return res.status(200).send(dispatcher(res, challengeResponse, 'success'));
        } catch (error) {
            next(error);
        }
    }
}