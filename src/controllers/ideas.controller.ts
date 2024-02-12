
import { NextFunction, Request, Response } from "express";;
import BaseController from "./base.controller";
import dispatcher from "../utils/dispatch.util";
import { speeches } from "../configs/speeches.config";
import { badRequest, notFound, unauthorized } from "boom";
import { ideas } from "../models/ideas.model";
import { themes_problems } from "../models/themes_problems.model";
import { Op } from "sequelize";
import fs from 'fs';
import { S3 } from "aws-sdk";

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
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'STUDENT') {
            return res.status(401).send(dispatcher(res, '', 'error', speeches.ROLE_ACCES_DECLINE, 401));
        }
        try {
            const { team_id, problem_statement_id, status } = req.body;
            if (!team_id) {
                throw unauthorized(speeches.USER_TEAMID_REQUIRED)
            }
            if (problem_statement_id === 0) {
                let result: any = await this.crudService.create(themes_problems, req.body);
                req.body['theme_problem_id'] = result.dataValues.theme_problem_id;
            } else {
                req.body['theme_problem_id'] = problem_statement_id;
            }
            req.body['financial_year_id'] = 1;
            if (status === 'DRAFT') {
                req.body['submitted_at'] = null;
            } else {
                let newDate = new Date();
                let newFormat = (newDate.getFullYear()) + "-" + (1 + newDate.getMonth()) + "-" + newDate.getUTCDate() + ' ' + newDate.getHours() + ':' + newDate.getMinutes() + ':' + newDate.getSeconds();
                req.body['submitted_at'] = newFormat;
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
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'STUDENT' && res.locals.role !== 'MENTOR' && res.locals.role !== 'STATE') {
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
                    ]
                }
            })
            return res.status(200).send(dispatcher(res, data, 'success'));
        } catch (error) {
            next(error);
        }
    }
    protected async handleAttachment(req: Request, res: Response, next: NextFunction) {
        if(res.locals.role !== 'ADMIN' && res.locals.role !== 'STUDENT' ){
            return res.status(401).send(dispatcher(res,'','error', speeches.ROLE_ACCES_DECLINE,401));
        }
        try {
            let newREQQuery : any = {}
            if(req.query.Data){
                let newQuery : any = await this.authService.decryptGlobal(req.query.Data);
                newREQQuery  = JSON.parse(newQuery);
            }else if(Object.keys(req.query).length !== 0){
                return res.status(400).send(dispatcher(res,'','error','Bad Request',400));
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
                return res.status(400).send(dispatcher(res,'','error','This file type not allowed',400)); 
            }
            const errs: any = [];
            let attachments: any = [];
            let result: any = {};
            let s3 = new S3({
                apiVersion: '2006-03-01',
                region: process.env.AWS_REGION,
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            });
            if (!req.files) {
                return result;
            }
            let file_name_prefix: any;
            if (process.env.DB_HOST?.includes("prod")) {
                file_name_prefix = `ideas/${team_id}`
            } else if (process.env.DB_HOST?.includes("dev")){
                file_name_prefix = `ideas/dev/${team_id}`
            } else {
                file_name_prefix = `ideas/stage/${team_id}`
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
}