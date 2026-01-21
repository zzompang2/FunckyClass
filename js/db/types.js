/**
 * 그룹 정보
 * @typedef {Object} Group
 * @property {number} group_id
 * @property {string} group_name
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * 선생님 정보
 * @typedef {Object} Teacher
 * @property {number} id
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} name
 * @property {string} memo
 */

/**
 * 반-선생님 매핑
 * @typedef {Object} GroupTeacher
 * @property {number} id
 * @property {string} created_at
 * @property {string} updated_at
 * @property {number} teacher_id
 * @property {number} group_id
 * @property {string} role    // 담임, 부담임
 * @property {string} memo
 */

/**
 * 수업 시간표
 * @typedef {Object} Schedule
 * @property {number} id
 * @property {string} created_at
 * @property {string} updated_at
 * @property {number} group_id
 * @property {number} teacher_id
 * @property {number} day        // 0=일 ~ 6=토
 * @property {string} start_time // HH:MM
 * @property {string} end_time   // HH:MM
 */

/**
 * 학생 정보
 * @typedef {Object} Student
 * @property {number} id
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} name
 * @property {string} school
 * @property {string} grade
 * @property {string} phone
 * @property {string} parent
 * @property {string} parent_phone
 * @property {string} memo
 */

/**
 * 반-학생 매핑
 * @typedef {Object} GroupStudent
 * @property {number} id
 * @property {string} created_at
 * @property {string} updated_at
 * @property {number} group_id
 * @property {number} student_id
 */

/**
 * 데이터 변경 이력
 * @typedef {Object} UpdateLog
 * @property {number} id
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} table_name    // groups | teachers | group_teachers | schedules | students | group_students
 * @property {number} record_id
 * @property {string} action        // INSERT | UPDATE | DELETE
 * @property {string|null} changed_field
 * @property {string|null} before_value
 * @property {string|null} after_value
 */

/**
 * 출석 기록
 * @typedef {Object} AttendanceRecord
 * @property {number} id
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} date          // YYYY-MM-DD
 * @property {number} student_id
 * @property {string} status        // 출석, 지각, 결석
 * @property {string} memo
 */

/**
 * 수업 계획
 * @typedef {Object} Plan
 * @property {number} id
 * @property {string} created_at
 * @property {string} updated_at
 * @property {number} group_id
 * @property {string} date          // YYYY-MM-DD
 * @property {string} memo
 * @property {string} lesson
 * @property {string} homework
 * @property {number|null} exam_id
 */

/**
 * 학생별 수업 계획 예외
 * @typedef {Object} PlanOverride
 * @property {number} id
 * @property {string} created_at
 * @property {string} updated_at
 * @property {number} plan_id
 * @property {number} student_id
 * @property {string} lesson
 * @property {string} homework
 */

/**
 * 시험 정보
 * @typedef {Object} Exam
 * @property {number} id
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} title
 * @property {string|null} unit
 * @property {string|null} difficulty
 * @property {number|null} question_number
 * @property {number|null} full_score
 * @property {string} memo
 */

/**
 * 시험 성적
 * @typedef {Object} ExamScore
 * @property {number} id
 * @property {string} created_at
 * @property {string} updated_at
 * @property {number} exam_id
 * @property {number} student_id
 * @property {string|null} date     // YYYY-MM-DD
 * @property {number|null} score
 * @property {string} memo
 */

/**
 * 수학 단원 정보
 * @typedef {Object} MathUnit
 * @property {number} id
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} subject
 * @property {number} chapter_no
 * @property {string} chapter_title
 * @property {number} section_no
 * @property {string} section_title
 * @property {string} memo
 */
