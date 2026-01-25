(function (App) {
  App.utils.constants = {
    DB_STORAGE_KEY: "funckyClassDB",

    MENU_CONFIG: Object.freeze({
      timetable:  { label: "시간표" },
      calender:   { label: "달력/todo" },
      diary:      { label: "다이어리" },
      db:         { label: "데이터베이스" },
    }),
    
    TAB_CONFIG: Object.freeze({
      info:     { label: "정보" },
      plans:    { label: "계획" },
      scores:   { label: "과제/성적" },
      message:  { label: "문자" },
      consult:  { label: "상담" },
    }),

    BACKUP_FILENAME: "funckyclass",

    DB_MESSAGE: {
      confirmRestore: "현재 데이터는 모두 덮어씌워집니다. 덮어씌우겠습니까?",
      successRestore: "데이터를 무사히 불러왔습니다.",
      confirmDelete: "정말 삭제하시겠습니까?",
    },

    FIELD_ALIAS: Object.freeze({
      'g.id': 'group_id',
      'g.name': 'group_name',
      'g.memo': 'group_memo',
      't.id': 'teacher_id',
      't.name': 'teacher_name',
      't.gender': 'teacher_gender',
      't.state': 'teacher_state',
      't.memo': 'teacher_memo',
      'gt.id': 'group_teacher_id',
      'gt.role': 'teacher_role',
      'gt.subject': 'teacher_subject',
      'sc.id': 'schedule_group_id',
      'sc.teacher_id': 'schedule_teacher_id',
      'sc.day': 'day',
      'sc.start_time': 'start_time',
      'sc.end_time': 'end_time',
      'st.id': 'student_id',
      'st.name': 'student_name',
      'st.gender': 'student_gender',
      'st.school': 'student_school',
      'st.grade': 'student_grade',
      'st.phone': 'student_phone',
      'st.parent': 'student_parent',
      'st.parent_phone': 'student_parent_phone',
      'st.state': 'student_state',
      'st.memo': 'student_memo',
      'st.created_at': 'student_created_at',
      'ul.id': 'log_id',
      'ul.table_name': 'log_table_name',
      'ul.record_id': 'log_record_id',
      'ul.action': 'log_action',
      'ul.changed_field': 'log_changed_field',
      'ul.before_value': 'log_before_value',
      'ul.after_value': 'log_after_value',
      'ul.updated_at': 'log_date',
      'p.id': 'plan_id',
      'p.group_id': 'plan_group_id',
      'p.date': 'plan_date',
      'p.memo': 'plan_memo',
      'p.lesson': 'plan_lesson',
      'p.homework': 'plan_homework',
      'p.exam': 'plan_exam',
      'p.notice': 'plan_notice',
      'at.id': 'attendance_id',
      'at.status': 'attendance_status',
      'at.memo': 'attendance_memo',
      'hs.id': 'homework_id',
      'hs.score': 'homework_score',
      'hs.memo': 'homework_memo',
      're.id': 'record_id',
      're.lesson': 'record_lesson',
      're.homework': 'record_homework',
      're.exam': 'record_exam',
      're.notice': 'record_notice',
      're.attendance': 'attendance',
      're.homework_score': 'homework_score',
      're.exam_score': 'exam_score',
      're.memo': 'record_memo',
    }),

    TEACHER_STATES: [
      { value: "active", label: "재직" },
      { value: "inactive", label: "퇴직" },
      { value: "", label: "미입력" },
    ],

    TEACHER_ROLES: [
      { value: "main", label: "담임" },
      { value: "sub", label: "부담임" },
      { value: "", label: "미입력" },
    ],

    DAY_STATES: [
      { value: 0, label: "일" },
      { value: 1, label: "월" },
      { value: 2, label: "화" },
      { value: 3, label: "수" },
      { value: 4, label: "목" },
      { value: 5, label: "금" },
      { value: 6, label: "토" }
    ],

    GENDER_STATES: [
      { value: "man", label: "남" },
      { value: "woman", label: "여" },
    ],

    STUDENT_STATES: [
      { value: "active", label: "재원" },
      { value: "inactive", label: "휴원" },
      { value: "dropped", label: "퇴원" },
      { value: "", label: "미입력" },
    ],

    ATTENDANCE_STATES: [
      { value: "present", label: "출석" },
      { value: "absent", label: "결석" },
      { value: "late", label: "지각" },
      { value: "leave", label: "조퇴" },
      { value: "", label: "미입력" },
    ],
  };
})(window.App);
