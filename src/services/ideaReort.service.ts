import BaseService from "./base.service";
import { QueryTypes } from "sequelize";
import db from "../utils/dbconnection.util";
export default class IdeaReportService extends BaseService {
    /**
     * truncates the data in idea_report tables and re entries
     * @returns Object 
     */
    executeIdeaDReport = async () => {
        const removeDtat = `truncate idea_report;`
        const CalData = `
       INSERT INTO idea_report(idea_id,team_id,status,evaluation_status,final_result,theme_problem_id,idea_title,solution_statement,detailed_solution,prototype_available,Prototype_file,idea_available,self_declaration,verified_by)
       SELECT 
           idea_id,
           team_id,
           status,
           evaluation_status,
           final_result,
           theme_problem_id,
           idea_title,
           solution_statement,
           detailed_solution,
           prototype_available,
           Prototype_file,
           idea_available,
           self_declaration,
           verified_by
       FROM
           ideas
           WHERE
           status = 'SUBMITTED';
       `
        const teamData = ` 
           UPDATE idea_report AS d
           JOIN
       (SELECT 
           team_name, team_id, mentor_id
       FROM
           teams) AS s ON d.team_id = s.team_id 
   SET 
       d.team_name = s.team_name,
       d.mentor_id = s.mentor_id;`
        const mentorData = `
           UPDATE idea_report AS d
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
       d.institution_id = s.institution_id;`
        const orgData = `
           UPDATE idea_report AS d
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
    d.principal_email = s.principal_email;`
        const allstudent = `UPDATE idea_report AS d
          JOIN
      (SELECT 
          GROUP_CONCAT(student_full_name
                  SEPARATOR ', ') AS names,
              team_id
      FROM
          students
      GROUP BY team_id) AS s ON d.team_id = s.team_id 
  SET 
      d.students_names = s.names;`
        const overallS = `UPDATE idea_report AS d
        JOIN
    (SELECT 
        AVG(overall) AS overall_score,
            AVG(param_1) AS novelty,
            AVG(param_3) AS feasibility,
            AVG(param_4) AS scalability,
            AVG(param_5) AS sustainability,
            AVG(param_2) AS useful,
            COUNT(idea_id) AS eval_count,
            idea_id
    FROM
        evaluator_ratings
    GROUP BY idea_id) AS s ON d.idea_id = s.idea_id 
SET 
    d.overall_score = s.overall_score,
    d.novelty = s.novelty,
    d.feasibility = s.feasibility,
    d.scalability = s.scalability,
    d.sustainability = s.sustainability,
    d.useful = s.useful,
    d.eval_count = s.eval_count;`
        const qualityS = `UPDATE idea_report AS d
           JOIN
       (SELECT 
           (AVG(param_1) + AVG(param_2)) / 2 AS sum_params,
               idea_id
       FROM
           evaluator_ratings
       GROUP BY idea_id) AS s ON d.idea_id = s.idea_id 
   SET 
       d.quality_score = s.sum_params;`
        const feasibilityS = `       UPDATE idea_report AS d
       JOIN
   (SELECT 
       (AVG(param_3) + AVG(param_4) + AVG(param_5)) / 3 AS sum_params,
           idea_id
   FROM
       evaluator_ratings
   GROUP BY idea_id) AS s ON d.idea_id = s.idea_id 
SET 
   d.feasibility_score = s.sum_params;`

        try {
            await db.query(removeDtat, {
                type: QueryTypes.RAW,
            });
            await db.query(CalData, {
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
            await db.query(allstudent, {
                type: QueryTypes.RAW,
            });
            await db.query(overallS, {
                type: QueryTypes.RAW,
            });
            await db.query(qualityS, {
                type: QueryTypes.RAW,
            });
            await db.query(feasibilityS, {
                type: QueryTypes.RAW,
            });
            console.log('idea Report SQL queries executed successfully.');
        } catch (error) {
            console.error('Error executing SQL queries:', error);
        }
    };
}