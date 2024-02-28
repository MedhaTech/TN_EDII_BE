import BaseService from "./base.service";
import { QueryTypes } from "sequelize";
import db from "../utils/dbconnection.util";
export default class StudentDReportService extends BaseService {
    /**
     * truncates the data in student report tables and re entries
     * @returns Object 
     */
    executeStudentDReport = async () => {
        const removeDtat = `truncate student_report;`
        const StuData = `INSERT INTO student_report(student_id,institution_course_id,student_full_name,Age,gender,team_id,user_id,year_of_study,date_of_birth,mobile,email)
       SELECT 
           student_id,institution_course_id,student_full_name, Age, gender,team_id,user_id,year_of_study,date_of_birth,mobile,email
       FROM
           students;
       `
        const teamData = ` 
       UPDATE student_report AS d
               JOIN
           (SELECT 
               team_id, team_name, mentor_id
           FROM
               teams) AS s ON d.team_id = s.team_id 
       SET 
           d.team_name = s.team_name,
           d.mentor_id = s.mentor_id;`
        const mentorData = `UPDATE student_report AS d
           JOIN
       (SELECT 
           mentor_id,
               mentor_name,
               mentor_mobile,
               mentor_email,
               institution_id
       FROM
           mentors
       JOIN users ON mentors.user_id = users.user_id) AS s ON d.mentor_id = s.mentor_id 
   SET 
       d.mentor_name = s.mentor_name,
       d.mentor_mobile = s.mentor_mobile,
       d.mentor_email = s.mentor_email,
       d.institution_id = s.institution_id;
       `
        const orgData = `UPDATE student_report AS d
        JOIN
    (SELECT 
        institution_id,
            state_name,
            district_name,
            block_name,
            taluk_name,
            place_name,
            institution_code,
            institution_name,
            principal_name,
            principal_mobile,
            principal_whatsapp_mobile,
            principal_email
    FROM
        institutions AS ins
    JOIN places AS p ON ins.place_id = p.place_id
    JOIN taluks AS t ON p.taluk_id = t.taluk_id
    JOIN blocks AS b ON t.block_id = b.block_id
    JOIN districts AS d ON b.district_id = d.district_id
    JOIN states AS s ON d.state_id = s.state_id) AS s ON d.institution_id = s.institution_id 
SET 
    d.state_name = s.state_name,
    d.district_name = s.district_name,
    d.block_name = s.block_name,
    d.taluk_name = s.taluk_name,
    d.place_name = s.place_name,
    d.institution_code = s.institution_code,
    d.institution_name = s.institution_name,
    d.principal_name = s.principal_name,
    d.principal_mobile = s.principal_mobile,
    d.principal_whatsapp_mobile = s.principal_whatsapp_mobile,
    d.principal_email = s.principal_email;`
        const ideaStatusData = `  
        UPDATE student_report AS d
        JOIN
    (SELECT 
        team_id, status
    FROM
        ideas) AS s ON d.team_id = s.team_id 
SET 
    d.idea_status = s.status;    
      `
        try {
            await db.query(removeDtat, {
                type: QueryTypes.RAW,
            });
            await db.query(StuData, {
                type: QueryTypes.RAW,
            });
            await db.query(teamData, {
                type: QueryTypes.RAW,
            });
            await db.query(mentorData, {
                type: QueryTypes.RAW,
            });
            await db.query(orgData, {
                type: QueryTypes.RAW,
            });
            await db.query(ideaStatusData, {
                type: QueryTypes.RAW,
            });
            console.log('Student Report SQL queries executed successfully.');
        } catch (error) {
            console.error('Error executing SQL queries:', error);
        }
    };
}