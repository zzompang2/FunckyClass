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
      memo: "TEXT DEFAULT ''",
    },

    teachers: {
      name: "TEXT NOT NULL",
      gender: "TEXT NOT NULL", // 남, 여
      state: "TEXT DEFAULT ''", // 재직, 휴직, 퇴직
      memo: "TEXT DEFAULT ''",
    },

    group_teachers: {
      group_id: "INTEGER NOT NULL",
      teacher_id: "INTEGER NOT NULL",
      role: "TEXT NOT NULL", // 담임, 부담임
      subject: "TEXT DEFAULT ''",
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
      gender: "TEXT NOT NULL", // 남, 여
      school: "TEXT DEFAULT ''",
      grade: "TEXT DEFAULT ''",
      phone: "TEXT DEFAULT ''", // 010-0000-0000
      parent: "TEXT DEFAULT ''",
      parent_phone: "TEXT DEFAULT ''", // 010-0000-0000
      state: "TEXT DEFAULT ''", // 재원, 휴원, 퇴원
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
      changed_field: "TEXT NOT NULL", // ex) "name"
      before_value: "TEXT NOT NULL",   // ex) "쳘슈"
      after_value: "TEXT NOT NULL",    // ex) "철수"
    },

    plans: {
      group_id: "INTEGER NOT NULL",
      date: "DATE NOT NULL", // YYYY-MM-DD
      memo: "TEXT DEFAULT ''",
      lesson: "TEXT DEFAULT ''",
      homework: "TEXT DEFAULT ''",
      exam: "TEXT DEFAULT ''",
      notice: "TEXT DEFAULT ''",
      __unique: "UNIQUE(group_id, date)",
    },

    student_records: {
      plan_id: "INTEGER NOT NULL",
      student_id: "INTEGER NOT NULL",
      lesson: "TEXT DEFAULT ''", // override
      homework: "TEXT DEFAULT ''", // override
      exam: "TEXT DEFAULT ''", // override
      notice: "TEXT DEFAULT ''", // override
      attendance: "TEXT DEFAULT ''", // 출석, 지각, 결석, 조퇴
      homework_score: "INTEGER DEFAULT 0", // 0~100 (%)
      exam_score: "INTEGER DEFAULT 0", // 0~100 (점)
      feedback: "TEXT DEFAULT ''",
      memo: "TEXT DEFAULT ''",
      __unique: "UNIQUE(plan_id, student_id)",
    },

    // exams: {
    //   title: "TEXT NOT NULL", // 시험지 이름
    //   difficulty: "TEXT DEFAULT ''",
    //   question_number: "INTEGER DEFAULT 0", // 문제 개수
    //   full_score: "INTEGER DEFAULT 100", // 만점 몇 점인지
    //   memo: "TEXT DEFAULT ''",
    //   __unique: "UNIQUE(title)",
    // },

    consults: {
      date: "TEXT DEFAULT ''",
      student_id: "INTEGER DEFAULT 0",
      content: "TEXT DEFAULT ''",
    },

    todos: {
      date: "TEXT DEFAULT ''",
      content: "TEXT DEFAULT ''",
      is_completed: "BOOLEAN DEFAULT FALSE",
      completed_at: "TEXT DEFAULT ''",
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