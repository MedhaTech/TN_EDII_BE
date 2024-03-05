import BaseService from "./base.service";
import { QueryTypes } from "sequelize";
import db from "../utils/dbconnection.util";
export default class SchoolDReportService extends BaseService {
    /**
     * truncates the data in School report tables and re entries
     * @returns Object 
     */
    executeInstDReport = async () => {
        const removeCode = `truncate Institution_report;`
        const insertOrgMentor = `
        INSERT INTO Institution_report (mentor_id,user_id,institution_id,institution_code,institution_name,principal_name,principal_mobile,principal_whatsapp_mobile,principal_email,mentor_title,mentor_name,mentor_mobile,mentor_whatapp_mobile,mentor_email,gender,date_of_birth)
        SELECT
            m.mentor_id,
            m.user_id,
            m.institution_id,
            ins.institution_code,
            ins.institution_name,
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
            m.date_of_birth
        FROM
            (mentors AS m)
                LEFT JOIN
            institutions AS ins ON m.institution_id = ins.institution_id
        WHERE
            ins.status = 'ACTIVE';
       `
        const UpdateInstdata = ` UPDATE Institution_report AS d
       JOIN
   (SELECT 
       institution_id,
           state_name,
           district_name,
           block_name,
           taluk_name,
           place_name
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
   d.place_name = s.place_name;`
        const updateTeamCount = `
        
    UPDATE Institution_report AS d
            JOIN
        (SELECT 
            COUNT(*) AS team_count, mentor_id
        FROM
            teams
        GROUP BY mentor_id) AS s ON d.mentor_id = s.mentor_id 
    SET 
        d.team_count = s.team_count;`
        const updateStudentCount = `
        
    UPDATE Institution_report AS d
            JOIN
        (SELECT 
            COUNT(*) AS student_count, mentor_id
        FROM
            teams
        JOIN students ON teams.team_id = students.team_id
        GROUP BY mentor_id) AS s ON d.mentor_id = s.mentor_id 
    SET 
        d.student_count = s.student_count;`
        const updateStuIdeaSubCount = `
        UPDATE Institution_report AS d
        JOIN
    (SELECT 
        COUNT(*) AS submittedcout, mentor_id
    FROM
        teams
    JOIN ideas ON teams.team_id = ideas.team_id
    WHERE
        ideas.status = 'SUBMITTED'
    GROUP BY mentor_id) AS s ON d.mentor_id = s.mentor_id 
SET 
    d.submittedcout = s.submittedcout;`
        const updateStuIdeaDraftCount = ` UPDATE Institution_report AS d
        JOIN
    (SELECT 
        COUNT(*) AS draftcout, mentor_id
    FROM
        teams
    JOIN ideas ON teams.team_id = ideas.team_id
    WHERE
        ideas.status = 'DRAFT'
    GROUP BY mentor_id) AS s ON d.mentor_id = s.mentor_id 
SET 
    d.draftcout = s.draftcout;`
        try {
            await db.query(removeCode, {
                type: QueryTypes.RAW,
            });
            await db.query(insertOrgMentor, {
                type: QueryTypes.RAW,
            });
            await db.query(UpdateInstdata, {
                type: QueryTypes.RAW,
            });
            await db.query(updateTeamCount, {
                type: QueryTypes.RAW,
            });
            await db.query(updateStudentCount, {
                type: QueryTypes.RAW,
            });
            await db.query(updateStuIdeaSubCount, {
                type: QueryTypes.RAW,
            });
            await db.query(updateStuIdeaDraftCount, {
                type: QueryTypes.RAW,
            });
            console.log('SQL queries executed successfully.');
        } catch (error) {
            console.error('Error executing SQL queries:', error);
        }
    };
}