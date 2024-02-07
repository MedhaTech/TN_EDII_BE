import { constents } from "./constents.config";

export const speeches = {
    USER_USERNAME_REQUIRED: "Username can not be null/empty",
    USER_FULLNAME_REQUIRED: "full_name can not be null/empty",
    USER_ROLE_REQUIRED: "Role can not be null/empty",
    USER_TEAMID_REQUIRED: "Team_id can not be null/empty",
    USER_PASSWORD_REQUIRED: "Password cant not be null/empty",
    USER_USERID_REQUIRED: "User_id cant not be null/empty",
    USER_OLDPASSWORD_REQUIRED: "Old Password cant not be null/empty",
    USER_NEWPASSWORD_REQUIRED: "New Password cant not be null/empty",
    USER_ORGANIZATION_CODE_REQUIRED: "Institution code cant not be null/empty",
    ROLE_ACCES_DECLINE:"Unauthorized Access! This user don't have permission",
    WELCOME_MESSAGE: "Welcome to the Unisolve APIs",
    UNABLE_TO_CREATE_TOKEN: "Unable to create token",
    INVALID_DATA_SEND_TO_CREATE_TOKEN: "Invalid data send to create token",
    INVALID_TOKEN: "Invalid token! Kindly provide a valid token",
    UNAUTHORIZED_ACCESS: "Unauthorized Access! Kindly provide a valid token",
    TOKEN_EXPIRED: "Token Expired! Kindly provide a valid token",
    BAD_REQUEST: "Bad Request",
    INTERNAL: "Interval Error Occured",
    DATA_CORRUPTED: "Data Corrupted, contact your administrator",
    NOT_ACCEPTABLE: "Not Acceptable",
    DATA_NOT_FOUND: "Data not found",
    UPLOAD_FAILD: "File upload failed",
    MENTOR_EXISTS: "Email ID already exists",
    MENTOR_NOT_EXISTS: "Mentor not found",
    AWSMESSAGEID: "Service not used, password is updated to default password",
    MOBILE_EXISTS: "Mobile Number already exists",
    STUDENT_EXISTS: "Student already exists",
    ADMIN_EXISTS: "Admin already exists",
    EVALUATOR_EXISTS: "Evaluator already exists",
    USER_NOT_FOUND: "User not found",
    USER_REG_STATUS: "User blocked",
    USER_PASSWORD: "User pasword doesn't match",
    USER_PASSWORD_CHANGE: "User password updated",
    USER_MOBILE_CHANGE: "User mobile number updated",
    USER_PASS_UPDATE:"User password is send to Eamil",
    OTP_SEND:"OTP send to mobile number",
    OTP_SEND_EMAIL:"OTP send to Email",
    USER_RISTRICTED: "Unauthorized Access!",
    USER_ROLE_CHECK: "Unauthorized Access, check the role",
    USER_DELETED: "User is ditected as deleted",
    USER_LOCKED: "User is ditected as locked",
    USER_INACTIVE: "User is ditected as inactive",
    USER_ALREADY_EXISTED: "User already existed with the Email and Phone Number.",
    USER_FULLNAME_EXISTED: "Student full name already existed",
    USER_EMAIL_EXISTED: "Student email already existed",
    USER_REGISTERED_SUCCESSFULLY: "User registered successfully",
    USER_LOGIN_SUCCESS: "Login Successful",
    USER_BADGES_LINKED: "Badge added to user successfully",
    LOGOUT_SUCCESS: "Logout Successful",
    USER_EMAIL_REQUIRED: "Email is required, it should not be empty.",
    USER_EMAIL_INVALID: "Email is invalid, it should be a valid email.",
    USER_PWD_REQUIRED: "Password is required, it should not be empty.",
    MOBILE_NUMBER_REQUIRED: "Mobile number is required, it should not be empty.",
    USER_QUALIFICATION_REQUIRED: "Qualification is required, it should not be empty.",
    CREATED_BY_REQUIRED: "Created_by is required, it should not be empty.",
    NAME_REQUIRED: "Name is required, it should not be empty.",
    DESCRIPTION_REQUIRED: "Description is required, it should not be empty.",
    ID_REQUIRED: "ID is required, it should not be empty.",
    TEAM_NAME_REQUIRED: "Team name is required, it should not be empty.",
    TEAM_NAME_ID: "Team ID is required, it should not be empty.",
    TEAM_NOT_FOUND: "Team not found, check the teamID.",
    STUDENT_MAX:"Mentor can have at max 50 Students",
    TEAM_MAX_MEMBES_EXCEEDED: `Team can have at max ${"" + constents.TEAMS_MAX_STUDENTS_ALLOWED} members`,
    //quiz submit response keys
    QUIZ_ID_REQUIRED: "Quiz ID is required, it should not be empty.",
    CHALLENGE_ID_REQUIRED: "Challenge ID is required, it should not be empty.",
    QUIZ_QUESTION_ID_REQUIRED: "QUIZ QUESTION ID is required, it should not be empty.",
    CHALLENGE_QUESTION_ID_REQUIRED: "CHALLENGE QUESTION ID is required, it should not be empty.",
    QUESTION_REQUIRED: "QUESTION is required, it should not be empty.",
    SELCTED_OPTION_REQUIRED: "Selected option is required, it should not be empty.",
    CORRECT_ANSWER_REQUIRED: "Correct answer is required, it should not be empty.",
    LEVEL_REQUIRED: "Level is required, it should not be empty.",
    CATEGORY_REQUIRED: "Category is required, it should not be empty.",
    QUESTION_NO_REQUIRED: "Question no is required, it should not be empty.",
    ATTEMPTS_REQUIRED : "Attempts is required, it should not be empty.",

    //worksheet submit resoponse keys 
    WORKSHEET_ID_REQUIRED: "WORKSHEET ID is required, it should not be empty.",
    WORKSHEET_FILE: "WORKSHEET_FILE is required, it should not be empty.",

    NOTIFICATION_TYPE_INVALID: `Notification type is invalid, it should be one from ${Object.values(constents.notification_types.list).join(", ")}.`,
    NOTIFICATION_TYPE_REQUIRED: `Notification type is required, it should be one from ${Object.values(constents.notification_types.list).join(", ")}.`,
    NOTIFICATION_TARGET_AUDIENCE_REQUIRED: "Target audience is required, it should be either 'All' or user_id(s) with ',' seperated.",
    NOTIFICATION_TITLE_REQUIRED: "Title is required, it should not be empty.",
    NOTIFICATION_MESSAGE_REQUIRED: "Message is required, it should not be empty.",
    NOTIFICATION_STATUS_INVALID: `Status is invalid, it should be one from ${Object.values(constents.notification_status_flags.list).join(", ")}.`,
    NOTIFICATION_STATUS_REQUIRED: `Status is required, it should be one from ${Object.values(constents.notification_status_flags.list).join(", ")}.`,
    NOTIFICATION_CREATED_SUCCESSFULLY: "Notification created successfully",
    NOTIFICATION_UPDATED_SUCCESSFULLY: "Notification updated successfully",
    NOTIFICATION_DELETED_SUCCESSFULLY: "Notification deleted successfully",

    COMMON_STATUS_INVALID: `Status is invalid, it should be one from ${Object.values(constents.common_status_flags.list).join(", ")}.`,
    RATING_STATUS_INVALID: `Rating is invalid, it should be one from ${Object.values(constents.evaluator_rating_level_flags.list).join(", ")}.`,
    COMMON_STATUS_REQUIRED: `Status is required, it should be one from ${Object.values(constents.common_status_flags.list).join(", ")}.`,
    RATING_STATUS_REQUIRED: `Rating is required, it should be one from ${Object.values(constents.common_status_flags.list).join(", ")}.`,
    EVALUATOR_STATUS_INVALID: `Status is invalid, it should be one from ${Object.values(constents.common_status_flags.list).join(", ")}.`,
    CERTIFICATE_INVALID: `certificate type is invalid, it should be one from ${Object.values(constents.certificate_flags.list).join(", ")}.`,
    EVALUATOR_STATUS_REQUIRED: `Status is required, it should be one from ${Object.values(constents.common_status_flags.list).join(", ")}.`,
    CHALLENGE_STATUS_INVALID: `Status is invalid, it should be one from ${Object.values(constents.challenges_flags.list).join(", ")}.`,
    CHALLENGE_STATUS_REQUIRED: `Status is required, it should be one from ${Object.values(constents.challenges_flags.list).join(", ")}.`,

    CREATED_FILE: "successfully Created",
    FILE_EMPTY: "Unable to create a file, Please check the payload",
    FETCH_FILE: "file found",

    EMAIL_SEND_ERROR: "Faild to send email",
    EMAIL_SEND_SUCCESS: "Email sent successfully.",
    FILE_REQUIRED: "Csv file is required",
    CSV_SEND_ERROR: "Failed to reading the file date",
    CSV_SEND_INTERNAL_ERROR: 'Something went wrong while create contact admin',
    CSV_DATA_EXIST: 'Data existing',
    DATA_EXIST: 'Data existed',
    FAQ_ID:'faq ID is required.',
    FAQ_CATEGORY: "Category is required.",
    FAQ_ANSWER: "Answer is required.",
    ORG_CODE_REQUIRED: "Institution code is required.",
    UNIQUE_CODE_REQUIRED: "Unique code is required.",
    ORG_CODE_NOT_EXISTS: "Institution code does not exists.",
    ORG_NAME_REQUIRED: "Institution name is required.",

    PRINCIPAL_NAME_REQ: "principal name  is required.",
    PRINCIPAL_EMAIL_REQ: "principal email  is required.",
    PRINCIPAL_MOBILE_REQ: "principal mobile  is required.",
    CITY_REQ: "city is required.",
    STATE_REQ: "state is required.",
    DISTRICT_REQ: "district is required.",
    CATEGORY_REQ:"category is required.",
    COUNTRY_REQ: "country  is required.",
    PINCODE_REQ: "Pin Code is required.",
    ADDRESS_REQ: "Address is required.",
    OTP_FAIL: "Wrong OTP Detected.",
    OTP_FOUND: "OTP matched.",
    QUERY_CATEGORY: "Category is required",
    QUERY_DETAILS: "Query cannot be null",
    QUERY_STATE: "state cannot be null",
    TEACHER_OBJECT: "Teacher object required",
    STUDENT_OBJECT: "Student object required",
    ROADMAP_FILE_CORRUPTED: "Roadmao file is corrupted, Please contact the administrator.",
    BADGE_IDS_ARRAY_REQUIRED: "badge_ids or badge_slugs any one of these array are required",
    VIDEO_STREAM_ID_REQUIRED: "Video stream id is required",
    TYPE_INVALID: "Invalid Type",
    TYPE_REQUIRED: "Type is required",
    INVALID_DATA: "Invalid Data, please check validity of data in the payload."
}
