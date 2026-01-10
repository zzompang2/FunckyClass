/**
 * 그룹 정보
 * @typedef {Object} Group
 * @property {number} id
 * @property {string} name
 * @property {string} subject
 * @property {string} teacher
 * @property {string} sub_teacher
 * @property {string} sub_subject
 */

/**
 * 변경 이력 레코드
 * @typedef {Object} History
 * @property {number} id
 * @property {string} table_name   // 변경된 테이블명
 * @property {number} row_id       // 변경된 row id
 * @property {string} field        // name | subject | teacher | sub_teacher | sub_subject
 * @property {string|null} old_value
 * @property {string|null} new_value
 * @property {string} changed_at   // ISO date string
 */

/**
 * 반 수업 스케줄
 * @typedef {Object} Schedule
 * @property {number} id
 * @property {number} group_id
 * @property {number} day          // 0: 일요일 ~ 6: 토요일
 * @property {string} start_time   // HH:mm
 * @property {string} end_time     // HH:mm
 */

/**
 * 학생 정보
 * @typedef {Object} Student
 * @property {number} id
 * @property {number} group_id
 * @property {string} name
 * @property {string|null} school
 * @property {number|null} year
 * @property {string|null} phone
 * @property {string|null} parent
 * @property {string|null} parent_phone
 * @property {string|null} memo
 */

/**
 * 수업 계획
 * @typedef {Object} Plan
 * @property {number} id
 * @property {number} group_id
 * @property {string} date         // YYYY.MM.DD
 * @property {string|null} lesson
 * @property {string|null} homework
 * @property {string|null} exam
 * @property {string|null} notice
 * @property {string|null} memo
 */

/**
 * 과제 및 시험 성적
 * @typedef {Object} Score
 * @property {number} id
 * @property {number} plan_id
 * @property {number} student_id
 * @property {string|null} homework_score
 * @property {number|null} exam_score
 */

/**
 * 상담 기록
 * @typedef {Object} Consult
 * @property {number} id
 * @property {string} date         // YYYY.MM.DD
 * @property {number} student_id
 * @property {string} content
 */
