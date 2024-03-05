import { Request, Response, NextFunction } from "express";
import { mentor } from "../models/mentor.model";
import { organization } from "../models/organization.model";
import TranslationService from "../services/translation.service";
import dispatcher from "../utils/dispatch.util";
import db from "../utils/dbconnection.util"
import { courseModuleSchema, courseModuleUpdateSchema } from "../validations/courseModule.validationa";
import { translationSchema, translationUpdateSchema } from "../validations/translation.validations";
import ValidationsHolder from "../validations/validationHolder";
import { quiz_survey_response } from '../models/quiz_survey_response.model';
import BaseController from "./base.controller";
import { constents } from "../configs/constents.config";
import { mentor_course_topic } from "../models/mentor_course_topic.model";
import { internal, notFound } from "boom";
import { speeches } from "../configs/speeches.config";
import ReportService from "../services/report.service";
import { Op, QueryTypes } from 'sequelize';
import { user } from "../models/user.model";
import { team } from "../models/team.model";
import { baseConfig } from "../configs/base.config";
import InstDReportService from "../services/instDReort.service";
import StudentDReportService from "../services/studentDReort.service";
import IdeaReportService from "../services/ideaReort.service";
import { institutions } from "../models/institutions.model";
import { places } from "../models/places.model";
import { taluks } from "../models/taluks.model";
import { blocks } from "../models/blocks.model";
import { districts } from "../models/districts.model";
import { states } from "../models/states.model";
//import { reflective_quiz_response } from '../models/reflective_quiz_response.model';

export default class ReportController extends BaseController {

    model = "mentor"; ///giving any name because this shouldnt be used in any apis in this controller

    protected initializePath(): void {
        this.path = '/reports';
    }
    protected initializeValidations(): void {
        // this.validations =  new ValidationsHolder(translationSchema,translationUpdateSchema);
    }
    protected initializeRoutes(): void {
        //example route to add 
        this.router.get(`${this.path}/mentorRegList`, this.getMentorRegList.bind(this));
        this.router.get(this.path + "/notRegistered", this.notRegistered.bind(this));
        this.router.get(this.path + "/mentorsummary", this.mentorsummary.bind(this));
        this.router.get(`${this.path}/studentdetailsreport`, this.getstudentDetailsreport.bind(this));
        this.router.get(`${this.path}/mentordetailsreport`, this.getmentorDetailsreport.bind(this));
        this.router.get(`${this.path}/mentordetailstable`, this.getmentorDetailstable.bind(this));
        this.router.get(`${this.path}/studentdetailstable`, this.getstudentDetailstable.bind(this));
        this.router.get(`${this.path}/refreshInstDReport`, this.refreshInstDReport.bind(this));
        this.router.get(`${this.path}/refreshStudentDReport`, this.refreshStudentDReport.bind(this));
        this.router.get(`${this.path}/refreshIdeaReport`, this.refreshIdeaReport.bind(this));
        this.router.get(`${this.path}/ideadeatilreport`, this.getideaReport.bind(this));
        this.router.get(`${this.path}/L1deatilreport`, this.getL1Report.bind(this));
        this.router.get(`${this.path}/L2deatilreport`, this.getL2Report.bind(this));
        this.router.get(`${this.path}/L3deatilreport`, this.getL3Report.bind(this));
        this.router.get(`${this.path}/L1ReportTable1`, this.getL1ReportTable1.bind(this));
        this.router.get(`${this.path}/L1ReportTable2`, this.getL1ReportTable2.bind(this));
        this.router.get(`${this.path}/L2ReportTable1`, this.getL2ReportTable1.bind(this));
        this.router.get(`${this.path}/L2ReportTable2`, this.getL2ReportTable2.bind(this));
        this.router.get(`${this.path}/L3ReportTable1`, this.getL3ReportTable1.bind(this));
        this.router.get(`${this.path}/L3ReportTable2`, this.getL3ReportTable2.bind(this));

        // super.initializeRoutes();
    }

    protected async getMentorRegList(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'REPORT' && res.locals.role !== 'STATE') {
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
            const { district_name } = newREQQuery;
            let whereText
            if (district_name !== 'All Districts') {
                whereText = `and d.district_name = '${district_name}'`
            } else {
                whereText = ''
            }
            const mentorsResult = await db.query(`SELECT 
                    mentor_title,
                    mentor_name,
                    mentor_name_vernacular,
                    mentor_mobile,
                    mentor_whatapp_mobile,
                    mentor_email,
                    date_of_birth,
                    gender,
                    institution_code,
                    institution_name,
                    place_type,
                    place_name,
                    taluk_name,
                    block_name,
                    district_name,
                    district_headquarters,
                    state_name
                FROM
                    mentors AS m
                        LEFT JOIN
                    institutions AS ins ON m.institution_id = ins.institution_id
                    LEFT JOIN
                    places AS p ON ins.place_id = p.place_id
                    LEFT JOIN
                    taluks AS t ON p.taluk_id = t.taluk_id
                    LEFT JOIN
                    blocks AS b ON t.block_id = b.block_id
                    LEFT JOIN
                    districts AS d ON b.district_id = d.district_id
                    LEFT JOIN
                    states AS s ON d.state_id = s.state_id
                WHERE
                    ins.status = 'ACTIVE' ${whereText};`, { type: QueryTypes.SELECT })
            if (!mentorsResult) {
                throw notFound(speeches.DATA_NOT_FOUND)
            }
            if (mentorsResult instanceof Error) {
                throw mentorsResult
            }
            res.status(200).send(dispatcher(res, mentorsResult, "success"))
        } catch (err) {
            next(err)
        }
    }
    protected async notRegistered(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'REPORT' && res.locals.role !== 'STATE') {
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
            const { district_name } = newREQQuery;
            let whereText
            if (district_name !== 'All Districts') {
                whereText = `&& d.district_name = '${district_name}'`
            } else {
                whereText = ''
            }
            const mentorsResult = await db.query(`SELECT 
            institution_code,
            institution_name,
            institution_name_vernacular,
            principal_name,
            principal_mobile,
            principal_whatsapp_mobile,
            principal_email,
            place_name,
            place_name_vernacular,
            taluk_name,
            taluk_name_vernacular,
            block_name,
            block_name_vernacular,
            district_name,
            district_name_vernacular,
            district_headquarters,
            district_headquarters_vernacular,
            state_name,
            state_name_vernacular
        FROM
            institutions AS ins
            LEFT JOIN
            places AS p ON ins.place_id = p.place_id
            LEFT JOIN
            taluks AS t ON p.taluk_id = t.taluk_id
            LEFT JOIN
            blocks AS b ON t.block_id = b.block_id
            LEFT JOIN
            districts AS d ON b.district_id = d.district_id
            LEFT JOIN
            states AS s ON d.state_id = s.state_id
        WHERE
            ins.status = 'ACTIVE'
            ${whereText}
                && NOT EXISTS( SELECT 
                    mentors.institution_id
                FROM
                    mentors
                WHERE
                    ins.institution_id = mentors.institution_id)`, { type: QueryTypes.SELECT });
            if (!mentorsResult) {
                throw notFound(speeches.DATA_NOT_FOUND)
            }
            if (mentorsResult instanceof Error) {
                throw mentorsResult
            }
            res.status(200).send(dispatcher(res, mentorsResult, "success"))
        } catch (err) {
            next(err)
        }
    }
    protected async mentorsummary(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'REPORT' && res.locals.role !== 'STATE') {
            return res.status(401).send(dispatcher(res, '', 'error', speeches.ROLE_ACCES_DECLINE, 401));
        }
        try {
            let data: any = {}
            let newREQQuery: any = {}
            if (req.query.Data) {
                let newQuery: any = await this.authService.decryptGlobal(req.query.Data);
                newREQQuery = JSON.parse(newQuery);
            } else if (Object.keys(req.query).length !== 0) {
                return res.status(400).send(dispatcher(res, '', 'error', 'Bad Request', 400));
            }
            const district_name = newREQQuery.district_name;
            let summary
            if (district_name) {
                summary = await db.query(`SELECT 
                org.district_name,
                org.institution_count,
                org.uniqueRegInstitution,
                org.male_mentor_count,
                org.female_mentor_count,
                org.male_mentor_count + org.female_mentor_count AS total_registered_mentor,
                org.institution_count - (org.uniqueRegInstitution) AS total_not_registered_mentor
            FROM
                (SELECT 
                    d.district_name,
                        COUNT(DISTINCT ins.institution_id) AS institution_count,
                        COUNT(DISTINCT m.institution_id) AS uniqueRegInstitution,
                        SUM(CASE
                            WHEN m.gender = 'Male' THEN 1
                            ELSE 0
                        END) AS male_mentor_count,
                        SUM(CASE
                            WHEN m.gender = 'Female' THEN 1
                            ELSE 0
                        END) AS female_mentor_count
                FROM
                    institutions AS ins
                JOIN places AS p ON ins.place_id = p.place_id
                JOIN taluks AS t ON p.taluk_id = t.taluk_id
                JOIN blocks AS b ON t.block_id = b.block_id
                JOIN districts AS d ON b.district_id = d.district_id
                JOIN states AS s ON d.state_id = s.state_id
                LEFT JOIN mentors m ON ins.institution_id = m.institution_id
                WHERE
                    ins.status = 'ACTIVE' && d.district_name = ${district_name}
                GROUP BY d.district_name) AS org `, { type: QueryTypes.SELECT });

            } else {
                summary = await db.query(`SELECT 
                org.district_name,
                org.institution_count,
                org.uniqueRegInstitution,
                org.male_mentor_count,
                org.female_mentor_count,
                org.male_mentor_count + org.female_mentor_count AS total_registered_mentor,
                org.institution_count - (org.uniqueRegInstitution) AS total_not_registered_mentor
            FROM
                (SELECT 
                    d.district_name,
                        COUNT(DISTINCT ins.institution_id) AS institution_count,
                        COUNT(DISTINCT m.institution_id) AS uniqueRegInstitution,
                        SUM(CASE
                            WHEN m.gender = 'Male' THEN 1
                            ELSE 0
                        END) AS male_mentor_count,
                        SUM(CASE
                            WHEN m.gender = 'Female' THEN 1
                            ELSE 0
                        END) AS female_mentor_count
                FROM
                    institutions AS ins
                JOIN places AS p ON ins.place_id = p.place_id
                JOIN taluks AS t ON p.taluk_id = t.taluk_id
                JOIN blocks AS b ON t.block_id = b.block_id
                JOIN districts AS d ON b.district_id = d.district_id
                JOIN states AS s ON d.state_id = s.state_id
                LEFT JOIN mentors m ON ins.institution_id = m.institution_id
                WHERE
                    ins.status = 'ACTIVE'
                GROUP BY d.district_name) AS org 
            UNION ALL SELECT 
                'Total',
                SUM(institution_count),
                SUM(uniqueRegInstitution),
                SUM(male_mentor_count),
                SUM(female_mentor_count),
                SUM(male_mentor_count + female_mentor_count),
                SUM(institution_count - uniqueRegInstitution)
            FROM
                (SELECT 
                    d.district_name,
                        COUNT(DISTINCT ins.institution_id) AS institution_count,
                        COUNT(DISTINCT m.institution_id) AS uniqueRegInstitution,
                        SUM(CASE
                            WHEN m.gender = 'Male' THEN 1
                            ELSE 0
                        END) AS male_mentor_count,
                        SUM(CASE
                            WHEN m.gender = 'Female' THEN 1
                            ELSE 0
                        END) AS female_mentor_count
                FROM
                    institutions AS ins
                JOIN places AS p ON ins.place_id = p.place_id
                JOIN taluks AS t ON p.taluk_id = t.taluk_id
                JOIN blocks AS b ON t.block_id = b.block_id
                JOIN districts AS d ON b.district_id = d.district_id
                JOIN states AS s ON d.state_id = s.state_id
                LEFT JOIN mentors m ON ins.institution_id = m.institution_id
                WHERE
                    ins.status = 'ACTIVE'
                GROUP BY d.district_name) AS org;`, { type: QueryTypes.SELECT });
            }
            data = summary;
            if (!data) {
                throw notFound(speeches.DATA_NOT_FOUND)
            }
            if (data instanceof Error) {
                throw data
            }
            res.status(200).send(dispatcher(res, data, "success"))
        } catch (err) {
            next(err)
        }
    }
    protected async getstudentDetailsreport(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'REPORT' && res.locals.role !== 'STATE') {
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
            const district_name = newREQQuery.district_name;
            let wherefilter = '';
            if (district_name !== 'All Districts') {
                wherefilter = `&& district_name= '${district_name}'`;
            }
            const data = await db.query(`SELECT 
            ins.institution_code,
            ins.institution_name,
            state_name,
            district_name,
            block_name,
            taluk_name,
            place_name,
            ins.principal_name,
            ins.principal_mobile,
            ins.principal_whatsapp_mobile,
            ins.principal_email,
            m.mentor_name,
            m.mentor_mobile,
            m.mentor_email,
            stu.student_full_name,
            stu.year_of_study,
            stu.date_of_birth,
            stu.mobile,
            stu.email,
            stu.Gender,
            stu.Age,
            teams.team_name,
            (SELECT 
                    status
                FROM
                    ideas
                WHERE
                    ideas.team_id = stu.team_id) AS idea_status
        FROM
            students AS stu
                LEFT JOIN
            teams ON stu.team_id = teams.team_id
                LEFT JOIN
            mentors AS m ON teams.mentor_id = m.mentor_id
                LEFT JOIN
            institutions AS ins ON m.institution_id = ins.institution_id
                LEFT JOIN
            places AS p ON ins.place_id = p.place_id
                LEFT JOIN
            taluks AS t ON p.taluk_id = t.taluk_id
                LEFT JOIN
            blocks AS b ON t.block_id = b.block_id
                LEFT JOIN
            districts AS d ON b.district_id = d.district_id
                LEFT JOIN
            states AS s ON d.state_id = s.state_id
        WHERE
            ins.status = 'ACTIVE' ${wherefilter}
                 order by district_name,mentor_name,team_name,student_full_name;`, { type: QueryTypes.SELECT });

            if (!data) {
                throw notFound(speeches.DATA_NOT_FOUND)
            }
            if (data instanceof Error) {
                throw data
            }
            res.status(200).send(dispatcher(res, data, "success"))
        } catch (err) {
            next(err)
        }
    }
    protected async getmentorDetailsreport(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'REPORT' && res.locals.role !== 'STATE') {
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
            const district_name = newREQQuery.district_name;
            let wherefilter = '';
            if (district_name !== 'All Districts') {
                wherefilter = `&& district_name= '${district_name}'`;
            }
            const data = await db.query(`SELECT 
            ins.institution_code,
            ins.institution_name,
            state_name,
            district_name,
            block_name,
            taluk_name,
            place_name,
            ins.principal_name,
            ins.principal_mobile,
            ins.principal_whatsapp_mobile,
            ins.principal_email,
            m.mentor_title,
            m.mentor_name,
            m.mentor_mobile,
            m.mentor_whatapp_mobile,
            m.mentor_email,
            m.gender,
            m.date_of_birth,
            (SELECT 
                    COUNT(*) AS team_count
                FROM
                    teams AS t
                WHERE
                    t.mentor_id = m.mentor_id) AS team_count,
            (SELECT 
                    COUNT(*) AS student_count
                FROM
                    teams
                        JOIN
                    students ON teams.team_id = students.team_id
                WHERE
                    teams.mentor_id = m.mentor_id) AS student_count,
            (SELECT 
                    COUNT(*) AS submittedcout
                FROM
                    teams
                        JOIN
                    ideas ON teams.team_id = ideas.team_id
                WHERE
                    ideas.status = 'SUBMITTED'
                        AND teams.mentor_id = m.mentor_id) AS submittedcout,
            (SELECT 
                    COUNT(*) AS draftcout
                FROM
                    teams
                        JOIN
                    ideas ON teams.team_id = ideas.team_id
                WHERE
                    ideas.status = 'DRAFT'
                        AND teams.mentor_id = m.mentor_id) AS draftcout
        FROM
            (mentors AS m)
                LEFT JOIN
            institutions AS ins ON m.institution_id = ins.institution_id
                LEFT JOIN
            places AS p ON ins.place_id = p.place_id
                LEFT JOIN
            taluks AS t ON p.taluk_id = t.taluk_id
                LEFT JOIN
            blocks AS b ON t.block_id = b.block_id
                LEFT JOIN
            districts AS d ON b.district_id = d.district_id
                LEFT JOIN
            states AS s ON d.state_id = s.state_id
        WHERE
            ins.status = 'ACTIVE'
            ${wherefilter}
            ORDER BY district_name,mentor_name;`, { type: QueryTypes.SELECT })
            if (!data) {
                throw notFound(speeches.DATA_NOT_FOUND)
            }
            if (data instanceof Error) {
                throw data
            }
            res.status(200).send(dispatcher(res, data, "success"))
        } catch (err) {
            next(err)
        }
    }
    protected async getmentorDetailstable(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'REPORT' && res.locals.role !== 'STATE') {
            return res.status(401).send(dispatcher(res, '', 'error', speeches.ROLE_ACCES_DECLINE, 401));
        }
        try {
            let data: any = {}
            let newREQQuery: any = {}
            if (req.query.Data) {
                let newQuery: any = await this.authService.decryptGlobal(req.query.Data);
                newREQQuery = JSON.parse(newQuery);
            } else if (Object.keys(req.query).length !== 0) {
                return res.status(400).send(dispatcher(res, '', 'error', 'Bad Request', 400));
            }
            const district_name = newREQQuery.district_name;
            let wherefilter = '';
            if (district_name) {
                wherefilter = `&& d.district_name= '${district_name}'`;
            }
            const RegInst = await db.query(`SELECT 
            d.district_name,
            COUNT(DISTINCT m.institution_id) AS totalRegInstitutions
        FROM
            institutions AS ins
                JOIN
            places AS p ON ins.place_id = p.place_id
                JOIN
            taluks AS t ON p.taluk_id = t.taluk_id
                JOIN
            blocks AS b ON t.block_id = b.block_id
                JOIN
            districts AS d ON b.district_id = d.district_id
                JOIN
            states AS s ON d.state_id = s.state_id
                LEFT JOIN
            mentors m ON ins.institution_id = m.institution_id
        WHERE
            ins.status = 'ACTIVE' ${wherefilter}
        GROUP BY d.district_name;`, { type: QueryTypes.SELECT });
            const summary = await db.query(`SELECT 
            d.district_name,
            COUNT(m.mentor_id) AS totalReg
        FROM
            institutions AS ins
                JOIN
            places AS p ON ins.place_id = p.place_id
                JOIN
            taluks AS t ON p.taluk_id = t.taluk_id
                JOIN
            blocks AS b ON t.block_id = b.block_id
                JOIN
            districts AS d ON b.district_id = d.district_id
                JOIN
            states AS s ON d.state_id = s.state_id
                LEFT JOIN
            mentors m ON ins.institution_id = m.institution_id
        WHERE
            ins.status = 'ACTIVE' ${wherefilter}
        GROUP BY d.district_name;`, { type: QueryTypes.SELECT });
            const teamCount = await db.query(`SELECT 
            d.district_name, COUNT(te.team_id) AS totalTeams
        FROM
            institutions AS ins
                JOIN
            places AS p ON ins.place_id = p.place_id
                JOIN
            taluks AS t ON p.taluk_id = t.taluk_id
                JOIN
            blocks AS b ON t.block_id = b.block_id
                JOIN
            districts AS d ON b.district_id = d.district_id
                JOIN
            states AS s ON d.state_id = s.state_id
                LEFT JOIN
            mentors m ON ins.institution_id = m.institution_id
                INNER JOIN
            teams AS te ON m.mentor_id = te.mentor_id
        WHERE
            ins.status = 'ACTIVE' ${wherefilter}
        GROUP BY d.district_name;`, { type: QueryTypes.SELECT });
            const studentCountDetails = await db.query(`SELECT 
            d.district_name,
            COUNT(st.student_id) AS totalstudent,
            SUM(CASE
                WHEN st.gender = 'MALE' THEN 1
                ELSE 0
            END) AS male,
            SUM(CASE
                WHEN st.gender = 'FEMALE' THEN 1
                ELSE 0
            END) AS female
        FROM
            institutions AS ins
                JOIN
            places AS p ON ins.place_id = p.place_id
                JOIN
            taluks AS t ON p.taluk_id = t.taluk_id
                JOIN
            blocks AS b ON t.block_id = b.block_id
                JOIN
            districts AS d ON b.district_id = d.district_id
                JOIN
            states AS s ON d.state_id = s.state_id
                LEFT JOIN
            mentors m ON ins.institution_id = m.institution_id
                INNER JOIN
            teams AS te ON m.mentor_id = te.mentor_id
                INNER JOIN
            students AS st ON st.team_id = te.team_id
        WHERE
            ins.status = 'ACTIVE' ${wherefilter}
        GROUP BY d.district_name;`, { type: QueryTypes.SELECT });
            data['summary'] = summary;
            data['Regschool'] = RegInst;
            data['teamCount'] = teamCount;
            data['studentCountDetails'] = studentCountDetails;
            if (!data) {
                throw notFound(speeches.DATA_NOT_FOUND)
            }
            if (data instanceof Error) {
                throw data
            }
            res.status(200).send(dispatcher(res, data, "success"))
        } catch (err) {
            next(err)
        }
    }
    protected async getstudentDetailstable(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'REPORT' && res.locals.role !== 'STATE') {
            return res.status(401).send(dispatcher(res, '', 'error', speeches.ROLE_ACCES_DECLINE, 401));
        }
        try {
            let data: any = {}
            let newREQQuery: any = {}
            if (req.query.Data) {
                let newQuery: any = await this.authService.decryptGlobal(req.query.Data);
                newREQQuery = JSON.parse(newQuery);
            } else if (Object.keys(req.query).length !== 0) {
                return res.status(400).send(dispatcher(res, '', 'error', 'Bad Request', 400));
            }
            const district_name = newREQQuery.district_name;
            let wherefilter = '';
            if (district_name) {
                wherefilter = `&& d.district_name= '${district_name}'`;
            }
            const summary = await db.query(`SELECT 
            d.district_name, COUNT(te.team_id) AS totalTeams
        FROM
            institutions AS ins
                JOIN
            places AS p ON ins.place_id = p.place_id
                JOIN
            taluks AS t ON p.taluk_id = t.taluk_id
                JOIN
            blocks AS b ON t.block_id = b.block_id
                JOIN
            districts AS d ON b.district_id = d.district_id
                JOIN
            states AS s ON d.state_id = s.state_id
                LEFT JOIN
            mentors m ON ins.institution_id = m.institution_id
                LEFT JOIN
            teams AS te ON m.mentor_id = te.mentor_id
        WHERE
            ins.status = 'ACTIVE' ${wherefilter}
        GROUP BY d.district_name;`, { type: QueryTypes.SELECT });
            const studentCountDetails = await db.query(`SELECT 
            d.district_name, COUNT(st.student_id) AS totalstudent
        FROM
            institutions AS ins
                JOIN
            places AS p ON ins.place_id = p.place_id
                JOIN
            taluks AS t ON p.taluk_id = t.taluk_id
                JOIN
            blocks AS b ON t.block_id = b.block_id
                JOIN
            districts AS d ON b.district_id = d.district_id
                JOIN
            states AS s ON d.state_id = s.state_id
                LEFT JOIN
            mentors m ON ins.institution_id = m.institution_id
                INNER JOIN
            teams AS te ON m.mentor_id = te.mentor_id
                INNER JOIN
            students AS st ON st.team_id = te.team_id
        WHERE
            ins.status = 'ACTIVE' ${wherefilter}
        GROUP BY d.district_name;`, { type: QueryTypes.SELECT });

            const submittedCount = await db.query(`
            SELECT 
    d.district_name, COUNT(te.team_id) AS submittedCount
FROM
    teams AS te
        JOIN
    mentors AS m ON te.mentor_id = m.mentor_id
        JOIN
    institutions AS ins ON m.institution_id = ins.institution_id
        JOIN
    places AS p ON ins.place_id = p.place_id
        JOIN
    taluks AS t ON p.taluk_id = t.taluk_id
        JOIN
    blocks AS b ON t.block_id = b.block_id
        JOIN
    districts AS d ON b.district_id = d.district_id
        JOIN
    (SELECT 
        team_id, status
    FROM
        ideas
    WHERE
        status = 'SUBMITTED') AS temp ON te.team_id = temp.team_id
WHERE
    ins.status = 'ACTIVE' ${wherefilter}
GROUP BY d.district_name`, { type: QueryTypes.SELECT });
            const draftCount = await db.query(`SELECT 
            d.district_name, COUNT(te.team_id) AS draftCount
        FROM
            teams AS te
                JOIN
            mentors AS m ON te.mentor_id = m.mentor_id
                JOIN
            institutions AS ins ON m.institution_id = ins.institution_id
                JOIN
            places AS p ON ins.place_id = p.place_id
                JOIN
            taluks AS t ON p.taluk_id = t.taluk_id
                JOIN
            blocks AS b ON t.block_id = b.block_id
                JOIN
            districts AS d ON b.district_id = d.district_id
                JOIN
            (SELECT 
                team_id, status
            FROM
                ideas
            WHERE
                status = 'DRAFT') AS temp ON te.team_id = temp.team_id
        WHERE
            ins.status = 'ACTIVE'
        GROUP BY d.district_name`, { type: QueryTypes.SELECT });
            data['summary'] = summary;
            data['studentCountDetails'] = studentCountDetails;
            data['submittedCount'] = submittedCount;
            data['draftCount'] = draftCount;
            if (!data) {
                throw notFound(speeches.DATA_NOT_FOUND)
            }
            if (data instanceof Error) {
                throw data
            }
            res.status(200).send(dispatcher(res, data, "success"))
        } catch (err) {
            next(err)
        }
    }
    private async refreshInstDReport(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'REPORT') {
            return res.status(401).send(dispatcher(res, '', 'error', speeches.ROLE_ACCES_DECLINE, 401));
        }
        try {
            const service = new InstDReportService()
            await service.executeInstDReport()
            const result = 'Institution Report SQL queries executed successfully.'
            res.status(200).json(dispatcher(res, result, "success"))
        } catch (err) {
            next(err);
        }
    }
    private async refreshStudentDReport(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'REPORT') {
            return res.status(401).send(dispatcher(res, '', 'error', speeches.ROLE_ACCES_DECLINE, 401));
        }
        try {
            const service = new StudentDReportService()
            await service.executeStudentDReport()
            const result = 'Student Report SQL queries executed successfully.'
            res.status(200).json(dispatcher(res, result, "success"))
        } catch (err) {
            next(err);
        }
    }
    private async refreshIdeaReport(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const service = new IdeaReportService()
            await service.executeIdeaDReport()
            const result = 'idea Report SQL queries executed successfully.'
            res.status(200).json(dispatcher(res, result, "success"))
        } catch (err) {
            next(err);
        }
    }
    protected async getideaReport(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'REPORT') {
            return res.status(401).send(dispatcher(res, '', 'error', speeches.ROLE_ACCES_DECLINE, 401));
        }
        try {
            let data: any = {}
            let newREQQuery: any = {}
            if (req.query.Data) {
                let newQuery: any = await this.authService.decryptGlobal(req.query.Data);
                newREQQuery = JSON.parse(newQuery);
            } else if (Object.keys(req.query).length !== 0) {
                return res.status(400).send(dispatcher(res, '', 'error', 'Bad Request', 400));
            }
            const district_name = newREQQuery.district_name;
            let wherefilter = '';
            if (district_name !== 'All Districts') {
                wherefilter = `&& district_name= '${district_name}'`;
            }
            data = await db.query(`SELECT 
            ins.institution_code,
            ins.institution_name,
            state_name,
            district_name,
            block_name,
            taluk_name,
            place_name,
            ins.principal_name,
            ins.principal_mobile,
            ins.principal_email,
            m.mentor_name,
            m.mentor_mobile,
            m.mentor_email,
            teams.team_name,
            (SELECT 
                    GROUP_CONCAT(student_full_name
                            SEPARATOR ', ') AS names
                FROM
                    students
                WHERE
                    students.team_id = teams.team_id) AS students_names,
            i.status,
            evaluation_status,
            final_result,
            idea_title,
            solution_statement,
            detailed_solution,
            prototype_available,
            Prototype_file,
            idea_available,
            self_declaration,
            verified_by,
            theme_name,
            problem_statement,
            problem_statement_description
        FROM
            ideas AS i
                LEFT JOIN
            teams ON i.team_id = teams.team_id
                LEFT JOIN
            mentors AS m ON teams.mentor_id = m.mentor_id
                LEFT JOIN
            institutions AS ins ON m.institution_id = ins.institution_id
                LEFT JOIN
            places AS p ON ins.place_id = p.place_id
                LEFT JOIN
            taluks AS t ON p.taluk_id = t.taluk_id
                LEFT JOIN
            blocks AS b ON t.block_id = b.block_id
                LEFT JOIN
            districts AS d ON b.district_id = d.district_id
                LEFT JOIN
            states AS s ON d.state_id = s.state_id
                LEFT JOIN
            themes_problems AS the ON i.theme_problem_id = the.theme_problem_id
        WHERE
            i.status = 'SUBMITTED' ${wherefilter}`, { type: QueryTypes.SELECT });
            if (!data) {
                throw notFound(speeches.DATA_NOT_FOUND)
            }
            if (data instanceof Error) {
                throw data
            }
            res.status(200).send(dispatcher(res, data, "success"))
        } catch (err) {
            next(err)
        }
    }
    protected async getL1Report(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'EADMIN') {
            return res.status(401).send(dispatcher(res, '', 'error', speeches.ROLE_ACCES_DECLINE, 401));
        }
        try {
            let data: any = {}
            let newREQQuery: any = {}
            if (req.query.Data) {
                let newQuery: any = await this.authService.decryptGlobal(req.query.Data);
                newREQQuery = JSON.parse(newQuery);
            } else if (Object.keys(req.query).length !== 0) {
                return res.status(400).send(dispatcher(res, '', 'error', 'Bad Request', 400));
            }
            const { state, district, sdg, category } = newREQQuery;
            let districtFilter: any = `'%%'`
            let categoryFilter: any = `'%%'`
            let stateFilter: any = `'%%'`
            let themesFilter: any = `'%%'`
            if (district !== 'All Districts' && district !== undefined) {
                districtFilter = `'${district}'`
            }
            if (category !== 'All Categorys' && category !== undefined) {
                categoryFilter = `'${category}'`
            }
            if (state !== 'All States' && state !== undefined) {
                stateFilter = `'${state}'`
            }
            if (sdg !== 'All Themes' && sdg !== undefined) {
                themesFilter = `'${sdg}'`
            }
            const summary = await db.query(`SELECT 
            organization_code,
            unique_code,
            state,
            district,
            challenge_response_id,
            organization_name,
            category,
            pin_code,
            address,
            full_name,
            email,
            mobile,
            team_name,
            students_names AS 'Students names',
            sdg,
            sub_category,
            response,
            evaluation_status
        FROM
            idea_report
            where evaluation_status in ('REJECTEDROUND1','SELECTEDROUND1') && state like ${stateFilter} && district like ${districtFilter} && sdg like ${themesFilter} && category like ${categoryFilter};`, { type: QueryTypes.SELECT });
            data = summary;
            if (!data) {
                throw notFound(speeches.DATA_NOT_FOUND)
            }
            if (data instanceof Error) {
                throw data
            }
            res.status(200).send(dispatcher(res, data, "success"))
        } catch (err) {
            next(err)
        }
    }
    protected async getL2Report(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'EADMIN') {
            return res.status(401).send(dispatcher(res, '', 'error', speeches.ROLE_ACCES_DECLINE, 401));
        }
        try {
            let data: any = {}
            let newREQQuery: any = {}
            if (req.query.Data) {
                let newQuery: any = await this.authService.decryptGlobal(req.query.Data);
                newREQQuery = JSON.parse(newQuery);
            } else if (Object.keys(req.query).length !== 0) {
                return res.status(400).send(dispatcher(res, '', 'error', 'Bad Request', 400));
            }
            const { state, district, sdg, category } = newREQQuery;
            let districtFilter: any = `'%%'`
            let categoryFilter: any = `'%%'`
            let stateFilter: any = `'%%'`
            let themesFilter: any = `'%%'`
            if (district !== 'All Districts' && district !== undefined) {
                districtFilter = `'${district}'`
            }
            if (category !== 'All Categorys' && category !== undefined) {
                categoryFilter = `'${category}'`
            }
            if (state !== 'All States' && state !== undefined) {
                stateFilter = `'${state}'`
            }
            if (sdg !== 'All Themes' && sdg !== undefined) {
                themesFilter = `'${sdg}'`
            }
            const summary = await db.query(`SELECT 
            organization_code,
            unique_code,
            state,
            district,
            challenge_response_id,
            organization_name,
            category,
            pin_code,
            address,
            full_name,
            email,
            mobile,
            team_name,
            students_names AS 'Students names',
            sdg,
            sub_category,
            response,
            overall_score AS 'Overall score',
            quality_score AS 'Quality score',
            feasibility_score AS 'Feasibility score',
            final_result
        FROM
            idea_report
            where evaluation_status = 'SELECTEDROUND1' && state like ${stateFilter} && district like ${districtFilter} && sdg like ${themesFilter} && category like ${categoryFilter};`, { type: QueryTypes.SELECT });
            data = summary;
            if (!data) {
                throw notFound(speeches.DATA_NOT_FOUND)
            }
            if (data instanceof Error) {
                throw data
            }
            res.status(200).send(dispatcher(res, data, "success"))
        } catch (err) {
            next(err)
        }
    }
    protected async getL3Report(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'EADMIN') {
            return res.status(401).send(dispatcher(res, '', 'error', speeches.ROLE_ACCES_DECLINE, 401));
        }
        try {
            let data: any = {}
            let newREQQuery: any = {}
            if (req.query.Data) {
                let newQuery: any = await this.authService.decryptGlobal(req.query.Data);
                newREQQuery = JSON.parse(newQuery);
            } else if (Object.keys(req.query).length !== 0) {
                return res.status(400).send(dispatcher(res, '', 'error', 'Bad Request', 400));
            }
            const { state, district, sdg, category } = newREQQuery;
            let districtFilter: any = `'%%'`
            let categoryFilter: any = `'%%'`
            let stateFilter: any = `'%%'`
            let themesFilter: any = `'%%'`
            if (district !== 'All Districts' && district !== undefined) {
                districtFilter = `'${district}'`
            }
            if (category !== 'All Categorys' && category !== undefined) {
                categoryFilter = `'${category}'`
            }
            if (state !== 'All States' && state !== undefined) {
                stateFilter = `'${state}'`
            }
            if (sdg !== 'All Themes' && sdg !== undefined) {
                themesFilter = `'${sdg}'`
            }
            const summary = await db.query(`SELECT 
            organization_code,
            unique_code,
            state,
            district,
            challenge_response_id,
            organization_name,
            category,
            pin_code,
            address,
            full_name,
            email,
            mobile,
            team_name,
            students_names AS 'Students names',
            sdg,
            sub_category,
            response,
            overall_score AS 'Overall score',
            quality_score AS 'Quality score',
            feasibility_score AS 'Feasibility score',
            final_result
        FROM
            idea_report
            where final_result <>'null' && state like ${stateFilter} && district like ${districtFilter} && sdg like ${themesFilter} && category like ${categoryFilter};`, { type: QueryTypes.SELECT });
            data = summary;
            if (!data) {
                throw notFound(speeches.DATA_NOT_FOUND)
            }
            if (data instanceof Error) {
                throw data
            }
            res.status(200).send(dispatcher(res, data, "success"))
        } catch (err) {
            next(err)
        }
    }
    protected async getL1ReportTable1(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'EADMIN') {
            return res.status(401).send(dispatcher(res, '', 'error', speeches.ROLE_ACCES_DECLINE, 401));
        }
        try {
            let data: any = {}
            let newREQQuery: any = {}
            if (req.query.Data) {
                let newQuery: any = await this.authService.decryptGlobal(req.query.Data);
                newREQQuery = JSON.parse(newQuery);
            } else if (Object.keys(req.query).length !== 0) {
                return res.status(400).send(dispatcher(res, '', 'error', 'Bad Request', 400));
            }
            const state = newREQQuery.state;
            let wherefilter = '';
            if (state) {
                wherefilter = `WHERE org.state= '${state}'`;
            }
            const summary = await db.query(`SELECT 
            org.state,
            COALESCE(totalSubmited, 0) AS totalSubmited,
            COALESCE(accepted, 0) AS accepted,
            COALESCE(rejected, 0) AS rejected
        FROM
            organizations AS org
                LEFT JOIN
            (SELECT 
                COUNT(*) AS totalSubmited,
                    state,
                    COUNT(CASE
                        WHEN evaluation_status = 'SELECTEDROUND1' THEN 1
                    END) AS accepted,
                    COUNT(CASE
                        WHEN evaluation_status = 'REJECTEDROUND1' THEN 1
                    END) AS rejected
            FROM
                challenge_responses AS cal
            WHERE
                cal.status = 'SUBMITTED'
            GROUP BY state) AS t2 ON org.state = t2.state
            ${wherefilter}
        GROUP BY org.state`, { type: QueryTypes.SELECT });
            data = summary;
            if (!data) {
                throw notFound(speeches.DATA_NOT_FOUND)
            }
            if (data instanceof Error) {
                throw data
            }
            res.status(200).send(dispatcher(res, data, "success"))
        } catch (err) {
            next(err)
        }
    }
    protected async getL1ReportTable2(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'EADMIN') {
            return res.status(401).send(dispatcher(res, '', 'error', speeches.ROLE_ACCES_DECLINE, 401));
        }
        try {
            let data: any = {}
            const summary = await db.query(`SELECT 
            user_id,
            full_name,
            COUNT(evaluated_by) AS totalEvaluated,
            COUNT(CASE
                WHEN evaluation_status = 'SELECTEDROUND1' THEN 1
            END) AS accepted,
            COUNT(CASE
                WHEN evaluation_status = 'REJECTEDROUND1' THEN 1
            END) AS rejected
        FROM
            challenge_responses AS cal
                JOIN
            evaluators AS evl ON cal.evaluated_by = evl.user_id
        WHERE
            cal.status = 'SUBMITTED'
        GROUP BY evaluated_by`, { type: QueryTypes.SELECT });
            data = summary;
            if (!data) {
                throw notFound(speeches.DATA_NOT_FOUND)
            }
            if (data instanceof Error) {
                throw data
            }
            res.status(200).send(dispatcher(res, data, "success"))
        } catch (err) {
            next(err)
        }
    }
    protected async getL2ReportTable1(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'EADMIN') {
            return res.status(401).send(dispatcher(res, '', 'error', speeches.ROLE_ACCES_DECLINE, 401));
        }
        try {
            let data: any = {}
            const summary = await db.query(`SELECT 
            challenge_response_id,
            AVG(overall) AS overall,
            (AVG(param_1) + AVG(param_2)) / 3 AS Quality,
            (AVG(param_3) + AVG(param_4) + AVG(param_5)) / 3 AS Feasibility
        FROM
            evaluator_ratings
        GROUP BY challenge_response_id;
        `, { type: QueryTypes.SELECT });
            data = summary;
            if (!data) {
                throw notFound(speeches.DATA_NOT_FOUND)
            }
            if (data instanceof Error) {
                throw data
            }
            res.status(200).send(dispatcher(res, data, "success"))
        } catch (err) {
            next(err)
        }
    }
    protected async getL2ReportTable2(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'EADMIN') {
            return res.status(401).send(dispatcher(res, '', 'error', speeches.ROLE_ACCES_DECLINE, 401));
        }
        try {
            let data: any = {}
            const summary = await db.query(`SELECT 
            user_id, full_name, COUNT(*) as totalEvaluated
        FROM
            evaluator_ratings
                JOIN
            evaluators ON evaluator_ratings.evaluator_id = evaluators.user_id
        GROUP BY user_id;`, { type: QueryTypes.SELECT });
            data = summary;
            if (!data) {
                throw notFound(speeches.DATA_NOT_FOUND)
            }
            if (data instanceof Error) {
                throw data
            }
            res.status(200).send(dispatcher(res, data, "success"))
        } catch (err) {
            next(err)
        }
    }
    protected async getL3ReportTable1(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'EADMIN') {
            return res.status(401).send(dispatcher(res, '', 'error', speeches.ROLE_ACCES_DECLINE, 401));
        }
        try {
            let data: any = {}
            const summary = await db.query(`
            SELECT 
    cal.challenge_response_id,
    AVG(overall) AS overall,
    (AVG(param_1) + AVG(param_2)) / 3 AS Quality,
    (AVG(param_3) + AVG(param_4) + AVG(param_5)) / 3 AS Feasibility
FROM
    evaluator_ratings AS evl_r
        JOIN
    challenge_responses AS cal ON evl_r.challenge_response_id = cal.challenge_response_id
WHERE
    final_result <> 'null'
GROUP BY challenge_response_id;`, { type: QueryTypes.SELECT });
            data = summary;
            if (!data) {
                throw notFound(speeches.DATA_NOT_FOUND)
            }
            if (data instanceof Error) {
                throw data
            }
            res.status(200).send(dispatcher(res, data, "success"))
        } catch (err) {
            next(err)
        }
    }
    protected async getL3ReportTable2(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'EADMIN') {
            return res.status(401).send(dispatcher(res, '', 'error', speeches.ROLE_ACCES_DECLINE, 401));
        }
        try {
            let data: any = {}
            let newREQQuery: any = {}
            if (req.query.Data) {
                let newQuery: any = await this.authService.decryptGlobal(req.query.Data);
                newREQQuery = JSON.parse(newQuery);
            } else if (Object.keys(req.query).length !== 0) {
                return res.status(400).send(dispatcher(res, '', 'error', 'Bad Request', 400));
            }
            const state = newREQQuery.state;
            let wherefilter = '';
            if (state) {
                wherefilter = `WHERE org.state= '${state}'`;
            }
            const summary = await db.query(`SELECT 
            org.state,
            COALESCE((runners + winners),0) AS shortedlisted,
            COALESCE(runners, 0) AS runners,
            COALESCE(winners, 0) AS winners
        FROM
            organizations AS org
                LEFT JOIN
            (SELECT 
                state,
                    COUNT(CASE
                        WHEN final_result = '0' THEN 1
                    END) AS runners,
                    COUNT(CASE
                        WHEN final_result = '1' THEN 1
                    END) AS winners
            FROM
                challenge_responses AS cal
            WHERE
                cal.status = 'SUBMITTED'
            GROUP BY state) AS t2 ON org.state = t2.state
            ${wherefilter}
        GROUP BY org.state`, { type: QueryTypes.SELECT });
            data = summary;
            if (!data) {
                throw notFound(speeches.DATA_NOT_FOUND)
            }
            if (data instanceof Error) {
                throw data
            }
            res.status(200).send(dispatcher(res, data, "success"))
        } catch (err) {
            next(err)
        }
    }
}
