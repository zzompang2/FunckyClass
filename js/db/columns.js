(function (App) {
  const COLUMN_DEFS = [
    {
      key: "group_name",
      label: "반 이름",
      source: {
        table: "groups",
        column: "name",
        idField: "group_id"
      },
      editable: true
    },
    {
      key: "group_memo",
      label: "메모",
      source: {
        table: "groups",
        column: "memo",
        idField: "group_id"
      },
      editable: true
    },

    {
      key: "teacher_name",
      label: "선생님",
      source: {
        table: "teachers",
        column: "name",
        idField: "teacher_id"
      },
      editable: true
    },
    {
      key: "teacher_gender",
      label: "성별",
      source: {
        table: "teachers",
        column: "gender",
        idField: "teacher_id"
      },
      editable: true
    },
    {
      key: "teacher_state",
      label: "상태",
      source: {
        table: "teachers",
        column: "state",
        idField: "teacher_id"
      },
      editable: true
    },
    {
      key: "teacher_memo",
      label: "선생님 메모",
      source: {
        table: "teachers",
        column: "memo",
        idField: "teacher_id"
      },
      editable: true
    },
    {
      key: "teacher_role",
      label: "역할",
      source: {
        table: "group_teachers",
        column: "role",
        idField: "group_teacher_id",
        editor: "select",
        options: ["담임", "부담임"]
      },
      editable: true
    },
    {
      key: "teacher_subject",
      label: "과목",
      source: {
        table: "group_teachers",
        column: "subject",
        idField: "group_teacher_id"
      },
      editable: true
    },

    {
      key: "schedules",
      label: "수업시간",
      source: {
        table: "group_teachers",
        column: "subject",
        idField: "group_teacher_id"
      },
      editable: false
    },

    {
      key: "day",
      label: "요일",
      source: {
        table: "schedules",
        column: "day",
        idField: "schedule_id",
        editor: "select",
        options: [
          { value: 0, label: "일" },
          { value: 1, label: "월" },
          { value: 2, label: "화" },
          { value: 3, label: "수" },
          { value: 4, label: "목" },
          { value: 5, label: "금" },
          { value: 6, label: "토" }
        ]
      },
      editable: true
    },

    {
      key: "start_time",
      label: "시작",
      source: {
        table: "schedules",
        column: "start_time",
        idField: "schedule_id",
        editor: "time"
      },
      editable: true
    },

    {
      key: "end_time",
      label: "종료",
      source: {
        table: "schedules",
        column: "end_time",
        idField: "schedule_id",
        editor: "time"
      },
      editable: true
    },

    {
      key: "student_name",
      label: "이름",
      source: { table: "students", column: "name", idField: "student_id" },
      editable: true
    },
    {
      key: "student_gender",
      label: "성별",
      source: {
        table: "students",
        column: "gender",
        idField: "student_id",
        editor: "select",
        options: ["남", "여"]
      },
      editable: true
    },
    {
      key: "student_school",
      label: "학교",
      source: { table: "students", column: "school", idField: "student_id" },
      editable: true
    },
    {
      key: "student_grade",
      label: "학년",
      source: { table: "students", column: "grade", idField: "student_id" },
      editable: true
    },
    {
      key: "student_phone",
      label: "전화번호",
      source: { table: "students", column: "phone", idField: "student_id" },
      editable: true
    },
    {
      key: "student_parent",
      label: "부모",
      source: { table: "students", column: "parent", idField: "student_id" },
      editable: true
    },
    {
      key: "student_parent_phone",
      label: "학부모 번호",
      source: { table: "students", column: "parent_phone", idField: "student_id" },
      editable: true
    },
    {
      key: "student_state",
      label: "상태",
      source: {
        table: "students",
        column: "state",
        idField: "student_id",
        editor: "select",
        options: ["재원", "휴원", "퇴원"]
      },
      editable: true
    },
    {
      key: "student_memo",
      label: "메모",
      source: { table: "students", column: "memo", idField: "student_id" },
      editable: true
    },

    {
      key: "log_table_name",
      label: "테이블 명",
      source: { table: "update_logs", column: "table_name", idField: "log_id" },
      editable: false
    },
    {
      key: "log_date",
      label: "수정일",
      source: { table: "update_logs", column: "updated_at", idField: "log_id" },
      editable: true
    },
    {
      key: "log_action",
      label: "수정 타입",
      source: { table: "update_logs", column: "action", idField: "log_id" },
      editable: false
    },
    {
      key: "log_changed_fields",
      label: "수정 타입",
      source: { table: "update_logs", column: "changed_fields", idField: "log_id" },
      editable: false
    },
    {
      key: "log_before_value",
      label: "이전 값",
      source: { table: "update_logs", column: "before_value", idField: "log_id" },
      editable: true
    },
    {
      key: "log_after_value",
      label: "새로운 값",
      source: { table: "update_logs", column: "after_value", idField: "log_id" },
      editable: true
    },
    
    
    
    
  ];

  App.db.getColumnDef = function (key) {
    for (const def of COLUMN_DEFS) {
      if (def.key === key) {
        return def;
      }
    }
    return;
  }
})(window.App);