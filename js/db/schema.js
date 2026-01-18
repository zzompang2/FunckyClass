/**
 * schema.js
 * 
 * DB_COLUMNS
 * 테이블 생성 SQL
 * UNIQUE, INDEX 관리
 * 실제 db 실행은 X
 */

(function (App) {
  const DB_COLUMNS = Object.freeze({
    groups: {
      name: "TEXT NOT NULL",
    },

    teachers: {
      name: "TEXT NOT NULL",
      memo: "TEXT DEFAULT ''",
    },

    group_teachers: {
      group_id: "INTEGER NOT NULL",
      teacher_id: "INTEGER NOT NULL",
      role: "TEXT NOT NULL", // 담임, 부담임
      memo: "TEXT DEFAULT ''",
    },

    schedules: {
      group_id: "INTEGER NOT NULL",
      teacher_id: "INTEGER NOT NULL",
      day: "INTEGER NOT NULL", // 0=일 ~ 6=토
      start_time: "TEXT NOT NULL", // HH:MM
      end_time: "TEXT NOT NULL", // HH:MM
    },

    students: {
      name: "TEXT NOT NULL",
      school: "TEXT DEFAULT ''",
      grade: "TEXT DEFAULT ''",
      phone: "TEXT DEFAULT ''", // 010-0000-0000
      parent: "TEXT DEFAULT ''",
      parent_phone: "TEXT DEFAULT ''", // 010-0000-0000
      memo: "TEXT DEFAULT ''",
    },

    group_students: {
      group_id: "INTEGER NOT NULL",
      student_id: "INTEGER NOT NULL",
    },

    update_logs: {
      table_name: "TEXT NOT NULL", // groups, teachers, group_teachers, schedules, students, group_students
      record_id: "INTEGER NOT NULL",
      action: "TEXT NOT NULL", // INSERT, UPDATE, DELETE
      changed_fields: "TEXT", // JSON string ["name", "school"]
      before_value: "TEXT",   // JSON string {name: "철수", school: "ㅁㅁ중"}
      after_value: "TEXT",    // JSON string {name: "영희", school: "ㅇㅇ중"}
    },

    attendance_records: {
      date: "DATE NOT NULL", // YYYY-MM-DD
      student_id: "INTEGER NOT NULL",
      status: "TEXT NOT NULL", // 출석, 지각, 결석
      memo: "TEXT DEFAULT ''",
    },

    plans: {
      group_id: "INTEGER NOT NULL",
      date: "DATE NOT NULL", // YYYY-MM-DD
      memo: "TEXT DEFAULT ''",
      lesson: "TEXT DEFAULT ''",
      homework: "TEXT DEFAULT ''",
      exam_id: "INTEGER",
    },

    plan_overrides: {
      plan_id: "INTEGER NOT NULL",
      student_id: "INTEGER NOT NULL",
      lesson: "TEXT DEFAULT ''",
      homework: "TEXT DEFAULT ''",
      __unique: "UNIQUE(plan_id, student_id)",
    },

    exams: {
      title: "TEXT NOT NULL", // 시험지 이름
      unit: "TEXT", // 과목, 단원
      difficulty: "TEXT",
      question_number: "INTEGER", // 문제 개수
      full_score: "INTEGER", // 만점 몇 점인지
      memo: "TEXT DEFAULT ''",
    },

    exam_scores: {
      exam_id: "INTEGER NOT NULL",
      student_id: "INTEGER NOT NULL",
      date: "DATE",
      score: "INTEGER",
      memo: "TEXT DEFAULT ''",
    },

    math_units: {
      subject: "TEXT NOT NULL",
      chapter_no: "INTEGER NOT NULL",
      chapter_title: "TEXT NOT NULL",
      section_no: "INTEGER NOT NULL",
      section_title: "TEXT NOT NULL",
      memo: "TEXT DEFAULT ''",
      __unique: "UNIQUE(subject, chapter_no, section_no)",
    }
  });

  /**
   * tableName 이름의 DB Table 생성.
   */
  function createTableSQL(tableName, columns) {
    if (columns == undefined) return;
    
    const defs = [
      "id INTEGER PRIMARY KEY AUTOINCREMENT", // 기본 PK
      "created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
      "updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
    ];

    for (const [col, def] of Object.entries(columns)) {
      if (!col.startsWith("__")) {
        defs.push(`${col} ${def}`);
      }
    }

    if (columns.__unique) {
      defs.push(columns.__unique);
    }

    return `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        ${defs.join(",\n")}
      );
    `;
  }

  function getAllCreateTableSQL() {
    return Object.entries(DB_COLUMNS).map(
      ([table, cols]) => createTableSQL(table, cols)
    );
  }

  App.db.schema = {
    DB_COLUMNS,
    createTableSQL,
    getAllCreateTableSQL,
  };
})(window.App);