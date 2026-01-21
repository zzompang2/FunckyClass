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
      'ul.id': 'log_id',
      'ul.table_name': 'log_table_name',
      'ul.record_id': 'log_record_id',
      'ul.action': 'log_action',
      'ul.changed_fields': 'log_changed_fields',
      'ul.before_value': 'log_before_value',
      'ul.after_value': 'log_after_value',
      'ul.updated_at': 'log_date',
    }),
  };
})(window.App);
