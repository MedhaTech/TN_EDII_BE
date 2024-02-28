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
import SchoolDReportService from "../services/schoolDReort.service";
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
        this.router.get(`${this.path}/mentorSurvey`, this.getmentorSurvey.bind(this));
        this.router.get(`${this.path}/studentSurvey`, this.getstudentSurvey.bind(this));
        this.router.get(`${this.path}/studentdetailsreport`, this.getstudentDetailsreport.bind(this));
        this.router.get(`${this.path}/mentordetailsreport`, this.getmentorDetailsreport.bind(this));
        this.router.get(`${this.path}/mentordetailstable`, this.getmentorDetailstable.bind(this));
        this.router.get(`${this.path}/studentdetailstable`, this.getstudentDetailstable.bind(this));
        this.router.get(`${this.path}/refreshSchoolDReport`, this.refreshSchoolDReport.bind(this));
        this.router.get(`${this.path}/refreshStudentDReport`, this.refreshStudentDReport.bind(this));
        this.router.get(`${this.path}/refreshIdeaReport`, this.refreshIdeaReport.bind(this));
        this.router.get(`${this.path}/studentATLnonATLcount`, this.getstudentATLnonATLcount.bind(this));
        this.router.get(`${this.path}/ideadeatilreport`, this.getideaReport.bind(this));
        this.router.get(`${this.path}/L1deatilreport`, this.getL1Report.bind(this));
        this.router.get(`${this.path}/L2deatilreport`, this.getL2Report.bind(this));
        this.router.get(`${this.path}/L3deatilreport`, this.getL3Report.bind(this));
        this.router.get(`${this.path}/ideaReportTable`, this.getideaReportTable.bind(this));
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
    protected async getmentorSurvey(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'REPORT') {
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
            const id = newREQQuery.id;
            let data: any = {}
            const summary = await db.query(`SELECT 
            mn.organization_code AS 'UDISE Code',
            og.organization_name AS 'School Name',
            og.category AS Category,
            og.district AS District,
            og.city AS City,
            og.principal_name AS 'HM Name',
            og.principal_mobile AS 'HM Contact',
            mn.full_name AS 'Name'
        FROM
            ((unisolve_db.quiz_survey_responses AS qz
            INNER JOIN unisolve_db.mentors AS mn ON qz.user_id = mn.user_id
                AND quiz_survey_id = ${id})
            INNER JOIN unisolve_db.organizations AS og ON mn.organization_code = og.organization_code)
        WHERE
            og.status = 'ACTIVE';`, { type: QueryTypes.SELECT });
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
    protected async getstudentSurvey(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'REPORT') {
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
            const id = newREQQuery.id;
            let data: any = {}
            const summary = await db.query(`SELECT 
            mn.organization_code AS 'UDISE Code',
            og.organization_name AS 'School Name',
            og.category AS Category,
            og.district AS District,
            og.city AS City,
            og.principal_name AS 'HM Name',
            og.principal_mobile AS 'HM Contact',
            st.full_name AS 'Name'
        FROM
            ((((unisolve_db.quiz_survey_responses AS qz
            INNER JOIN unisolve_db.students AS st ON qz.user_id = st.user_id
                AND quiz_survey_id = ${id})
            INNER JOIN unisolve_db.teams AS t ON st.team_id = t.team_id)
            INNER JOIN unisolve_db.mentors AS mn ON t.mentor_id = mn.mentor_id)
            INNER JOIN unisolve_db.organizations AS og ON mn.organization_code = og.organization_code)
        WHERE
            og.status = 'ACTIVE'; `, { type: QueryTypes.SELECT });
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
            const { category, district, state } = newREQQuery;
            let data: any = {}
            let districtFilter: any = ''
            let categoryFilter: any = ''
            let stateFilter: any = ''
            if (district !== 'All Districts' && category !== 'All Categorys' && state !== 'All States') {
                districtFilter = `'${district}'`
                categoryFilter = `'${category}'`
                stateFilter = `'${state}'`
            } else if (district !== 'All Districts') {
                districtFilter = `'${district}'`
                categoryFilter = `'%%'`
                stateFilter = `'%%'`
            } else if (category !== 'All Categorys') {
                categoryFilter = `'${category}'`
                districtFilter = `'%%'`
                stateFilter = `'%%'`
            } else if (state !== 'All States') {
                stateFilter = `'${state}'`
                districtFilter = `'%%'`
                categoryFilter = `'%%'`
            }
            else {
                districtFilter = `'%%'`
                categoryFilter = `'%%'`
                stateFilter = `'%%'`
            }
            const summary = await db.query(`SELECT 
                    udise_code AS 'ATL code',
                    unique_code AS 'UDISE code',
                    school_name AS 'School Name',
                    state,
                    district,
                    category,
                    city,
                    hm_name AS 'HM Name',
                    hm_contact AS 'HM Contact',
                    teacher_name AS 'Teacher Name',
                    teacher_email AS 'Teacher Email',
                    teacher_gender AS 'Teacher Gender',
                    teacher_contact AS 'Teacher Contact',
                    teacher_whatsapp_contact AS 'Teacher WhatsApp Contact',
                    team_name AS 'Team Name',
                    student_name AS 'Student Name',
                    student_username AS 'Student Username',
                    Age,
                    gender,
                    Grade,
                    disability AS 'Disability status',
                    idea_status AS 'Idea Status',
                    course_status,
                    post_survey_status AS 'Post Survey Status'
                FROM
                    student_report
                WHERE
                    status = 'ACTIVE' && state like ${stateFilter} && district like ${districtFilter} 
                    && category like ${categoryFilter} order by district,teacher_name,team_name,student_name;`, { type: QueryTypes.SELECT });
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
            const { category, district, state } = newREQQuery;
            let data: any = {}
            let districtFilter: any = ''
            let categoryFilter: any = ''
            let stateFilter: any = ''
            if (district !== 'All Districts' && category !== 'All Categorys' && state !== 'All States') {
                districtFilter = `'${district}'`
                categoryFilter = `'${category}'`
                stateFilter = `'${state}'`
            } else if (district !== 'All Districts') {
                districtFilter = `'${district}'`
                categoryFilter = `'%%'`
                stateFilter = `'%%'`
            } else if (category !== 'All Categorys') {
                categoryFilter = `'${category}'`
                districtFilter = `'%%'`
                stateFilter = `'%%'`
            } else if (state !== 'All States') {
                stateFilter = `'${state}'`
                districtFilter = `'%%'`
                categoryFilter = `'%%'`
            }
            else {
                districtFilter = `'%%'`
                categoryFilter = `'%%'`
                stateFilter = `'%%'`
            }
            const summary = await db.query(`SELECT 
                udise_code AS 'ATL code',
                unique_code AS 'UDISE code',
                school_name AS 'School Name',
                state,
                district,
                category,
                city,
                hm_name AS 'HM Name',
                hm_contact AS 'HM Contact',
                teacher_name AS 'Teacher Name',
                teacher_email AS 'Teacher Email',
                teacher_gender AS 'Teacher Gender',
                teacher_contact AS 'Teacher Contact',
                teacher_whatsapp_contact AS 'Teacher WhatsApp Contact',
                course_status AS 'Course Status',
                post_survey_status AS 'Post Survey Status',
                team_count,
                student_count,
                countop,
                courseinprogess,
                submittedcout,
                draftcout
            FROM
                school_report
            WHERE
            state LIKE ${stateFilter} && district LIKE ${districtFilter} && category LIKE ${categoryFilter}
            ORDER BY district,teacher_name;`, { type: QueryTypes.SELECT })
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
            const state = newREQQuery.state;
            let wherefilter = '';
            if (state) {
                wherefilter = `&& og.state= '${state}'`;
            }
            const summary = await db.query(`SELECT 
            og.state, COUNT(mn.mentor_id) AS totalReg
        FROM
            organizations AS og
                LEFT JOIN
            mentors AS mn ON og.organization_code = mn.organization_code
            WHERE og.status='ACTIVE' ${wherefilter}
        GROUP BY og.state;`, { type: QueryTypes.SELECT });
            const teamCount = await db.query(`SELECT 
        og.state, COUNT(t.team_id) AS totalTeams
    FROM
        organizations AS og
            LEFT JOIN
        mentors AS mn ON og.organization_code = mn.organization_code
            INNER JOIN
        teams AS t ON mn.mentor_id = t.mentor_id
        WHERE og.status='ACTIVE' ${wherefilter}
    GROUP BY og.state;`, { type: QueryTypes.SELECT });
            const studentCountDetails = await db.query(`SELECT 
        og.state,
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
        organizations AS og
            LEFT JOIN
        mentors AS mn ON og.organization_code = mn.organization_code
            INNER JOIN
        teams AS t ON mn.mentor_id = t.mentor_id
            INNER JOIN
        students AS st ON st.team_id = t.team_id
        WHERE og.status='ACTIVE' ${wherefilter}
    GROUP BY og.state;`, { type: QueryTypes.SELECT });
            const courseINcompleted = await db.query(`select state,count(*) as courseIN from (SELECT 
            state,cou
        FROM
            unisolve_db.organizations AS og
                LEFT JOIN
            (SELECT 
                organization_code, cou
            FROM
                unisolve_db.mentors AS mn
            LEFT JOIN (SELECT 
                user_id, COUNT(*) AS cou
            FROM
                unisolve_db.mentor_topic_progress
            GROUP BY user_id having count(*)<8) AS t ON mn.user_id = t.user_id ) AS c ON c.organization_code = og.organization_code WHERE og.status='ACTIVE' ${wherefilter}
        group by organization_id having cou<8) as final group by state;`, { type: QueryTypes.SELECT });
            const courseCompleted = await db.query(`select state,count(*) as courseCMP from (SELECT 
            state,cou
        FROM
            unisolve_db.organizations AS og
                LEFT JOIN
            (SELECT 
                organization_code, cou
            FROM
                unisolve_db.mentors AS mn
            LEFT JOIN (SELECT 
                user_id, COUNT(*) AS cou
            FROM
                unisolve_db.mentor_topic_progress
            GROUP BY user_id having count(*)>=8) AS t ON mn.user_id = t.user_id ) AS c ON c.organization_code = og.organization_code WHERE og.status='ACTIVE' ${wherefilter}
        group by organization_id having cou>=8) as final group by state`, { type: QueryTypes.SELECT });
            data['summary'] = summary;
            data['teamCount'] = teamCount;
            data['studentCountDetails'] = studentCountDetails;
            data['courseCompleted'] = courseCompleted;
            data['courseINcompleted'] = courseINcompleted;
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
            const state = newREQQuery.state;
            let wherefilter = '';
            if (state) {
                wherefilter = `&& og.state= '${state}'`;
            }
            const summary = await db.query(`SELECT 
            og.state, COUNT(t.team_id) AS totalTeams
        FROM
            organizations AS og
                LEFT JOIN
            mentors AS mn ON og.organization_code = mn.organization_code
                LEFT JOIN
            teams AS t ON mn.mentor_id = t.mentor_id
            WHERE og.status='ACTIVE' ${wherefilter}
        GROUP BY og.state;`, { type: QueryTypes.SELECT });
            const studentCountDetails = await db.query(`SELECT 
            og.state,
            COUNT(st.student_id) AS totalstudent
        FROM
            organizations AS og
                LEFT JOIN
            mentors AS mn ON og.organization_code = mn.organization_code
                INNER JOIN
            teams AS t ON mn.mentor_id = t.mentor_id
                INNER JOIN
            students AS st ON st.team_id = t.team_id where og.status = 'ACTIVE' ${wherefilter}
        GROUP BY og.state;`, { type: QueryTypes.SELECT });
            const courseCompleted = await db.query(`SELECT 
            og.state,count(st.student_id) as studentCourseCMP
        FROM
            students AS st
                JOIN
            teams AS te ON st.team_id = te.team_id
                JOIN
            mentors AS mn ON te.mentor_id = mn.mentor_id
                JOIN
            organizations AS og ON mn.organization_code = og.organization_code
                JOIN
            (SELECT 
                user_id, COUNT(*)
            FROM
                user_topic_progress
            GROUP BY user_id
            HAVING COUNT(*) >= 31) AS temp ON st.user_id = temp.user_id WHERE og.status='ACTIVE' ${wherefilter} group by og.state`, { type: QueryTypes.SELECT });
            const courseINprogesss = await db.query(`SELECT 
            og.state,count(st.student_id) as studentCourseIN
        FROM
            students AS st
                JOIN
            teams AS te ON st.team_id = te.team_id
                JOIN
            mentors AS mn ON te.mentor_id = mn.mentor_id
                JOIN
            organizations AS og ON mn.organization_code = og.organization_code
                JOIN
            (SELECT 
                user_id, COUNT(*)
            FROM
                user_topic_progress
            GROUP BY user_id
            HAVING COUNT(*) < 31) AS temp ON st.user_id = temp.user_id WHERE og.status='ACTIVE' ${wherefilter} group by og.state`, { type: QueryTypes.SELECT });
            const submittedCount = await db.query(`SELECT 
            og.state,count(te.team_id) as submittedCount
        FROM
            teams AS te
                JOIN
            mentors AS mn ON te.mentor_id = mn.mentor_id
                JOIN
            organizations AS og ON mn.organization_code = og.organization_code
                JOIN
            (SELECT 
                team_id, status
            FROM
                challenge_responses
            WHERE
                status = 'SUBMITTED') AS temp ON te.team_id = temp.team_id WHERE og.status='ACTIVE' ${wherefilter} group by og.state`, { type: QueryTypes.SELECT });
            const draftCount = await db.query(`SELECT 
            og.state,count(te.team_id) as draftCount
        FROM
            teams AS te
                JOIN
            mentors AS mn ON te.mentor_id = mn.mentor_id
                JOIN
            organizations AS og ON mn.organization_code = og.organization_code
                JOIN
            (SELECT 
                team_id, status
            FROM
                challenge_responses
            WHERE
                status = 'DRAFT') AS temp ON te.team_id = temp.team_id WHERE og.status='ACTIVE' ${wherefilter} group by og.state`, { type: QueryTypes.SELECT });
            data['summary'] = summary;
            data['studentCountDetails'] = studentCountDetails;
            data['courseCompleted'] = courseCompleted;
            data['courseINprogesss'] = courseINprogesss;
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
    private async refreshSchoolDReport(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'REPORT') {
            return res.status(401).send(dispatcher(res, '', 'error', speeches.ROLE_ACCES_DECLINE, 401));
        }
        try {
            const service = new SchoolDReportService()
            await service.executeSchoolDReport()
            const result = 'School Report SQL queries executed successfully.'
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
    protected async getstudentATLnonATLcount(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
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
            const state = newREQQuery.state;
            let wherefilter = '';
            if (state) {
                wherefilter = `WHERE org.state= '${state}'`;
            }
            const summary = await db.query(`SELECT 
            org.state, COALESCE(ATL_Student_Count, 0) as ATL_Student_Count, COALESCE(NONATL_Student_Count, 0) as NONATL_Student_Count
        FROM
            organizations AS org
               left JOIN
            (SELECT 
                o.state,
                    COUNT(CASE
                        WHEN o.category = 'ATL' THEN 1
                    END) AS ATL_Student_Count,
                    COUNT(CASE
                        WHEN o.category = 'Non ATL' THEN 1
                    END) AS NONATL_Student_Count
            FROM
                students AS s
            JOIN teams AS t ON s.team_id = t.team_id
            JOIN mentors AS m ON t.mentor_id = m.mentor_id
            JOIN organizations AS o ON m.organization_code = o.organization_code
            WHERE
                o.status = 'ACTIVE'
            GROUP BY o.state) AS t2 ON org.state = t2.state
            ${wherefilter}
        GROUP BY org.state;`, { type: QueryTypes.SELECT });
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
            response
        FROM
            idea_report
            where status = 'SUBMITTED' && state like ${stateFilter} && district like ${districtFilter} && sdg like ${themesFilter} && category like ${categoryFilter};`, { type: QueryTypes.SELECT });
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
    protected async getideaReportTable(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
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
            const state = newREQQuery.state;
            let wherefilter = '';
            if (state) {
                wherefilter = `WHERE org.state= '${state}'`;
            }
            const summary = await db.query(`SELECT 
            org.state,
            COALESCE(totalSubmited, 0) AS totalSubmited,
            COALESCE(ATL_Count, 0) AS ATL_Count,
            COALESCE(NonATL_Count, 0) AS NonATL_Count,
            COALESCE(Agriculture, 0) AS Agriculture,
            COALESCE(Inclusivity, 0) AS Inclusivity,
            COALESCE(Mobility, 0) AS Mobility,
            COALESCE(DisasterManagement, 0) AS DisasterManagement,
            COALESCE(Space, 0) AS Space,
            COALESCE(Health, 0) AS Health,
            COALESCE(EducationSkillDevelopment, 0) AS EducationSkillDevelopment,
            COALESCE(OTHERS, 0) AS OTHERS
        FROM
            organizations AS org
                LEFT JOIN
            (SELECT 
                COUNT(*) AS totalSubmited,
                    COUNT(CASE
                        WHEN org.category = 'ATL' THEN 1
                    END) AS ATL_Count,
                    COUNT(CASE
                        WHEN org.category = 'Non ATL' THEN 1
                    END) AS NonATL_Count,
                    COUNT(CASE
                        WHEN cal.sdg = 'Agriculture' THEN 1
                    END) AS Agriculture,
                    COUNT(CASE
                        WHEN cal.sdg = 'Inclusivity' THEN 1
                    END) AS Inclusivity,
                    COUNT(CASE
                        WHEN cal.sdg = 'Mobility' THEN 1
                    END) AS Mobility,
                    COUNT(CASE
                        WHEN cal.sdg = 'Disaster Management' THEN 1
                    END) AS DisasterManagement,
                    COUNT(CASE
                        WHEN cal.sdg = 'Health' THEN 1
                    END) AS Health,
                    COUNT(CASE
                        WHEN cal.sdg = 'Space' THEN 1
                    END) AS Space,
                    COUNT(CASE
                        WHEN cal.sdg = 'Education & Skill Development' THEN 1
                    END) AS EducationSkillDevelopment,
                    COUNT(CASE
                        WHEN cal.sdg = 'OTHERS' THEN 1
                    END) AS OTHERS,
                    org.state
            FROM
                challenge_responses AS cal
            JOIN teams AS t ON cal.team_id = t.team_id
            JOIN mentors AS m ON t.mentor_id = m.mentor_id
            JOIN organizations AS org ON m.organization_code = org.organization_code
            WHERE
                cal.status = 'SUBMITTED'
            GROUP BY org.state) AS t2 ON org.state = t2.state
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
