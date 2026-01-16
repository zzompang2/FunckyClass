window.Schema = (function () {
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

    change_logs: {
      table_name: "TEXT NOT NULL", // groups, teachers, group_teachers, schedules, students, group_students
      record_id: "INTEGER NOT NULL",
      action: "TEXT NOT NULL", // INSERT, UPDATE, DELETE
      changed_fields: "TEXT", // JSON string ["name", "school"]
      before_value: "TEXT",   // JSON string {name: "철수", school: "ㅁㅁ중"}
      after_value: "TEXT",    // JSON string {name: "영희", school: "ㅇㅇ중"}
      changed_at: "DATETIME DEFAULT CURRENT_TIMESTAMP", // YYYY-MM-DD HH:MM:SS (string 타입 in JS)
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
   * DB_COLUMNS에 적힌 스키마를 바탕으로
   * 기본 테이블들을 생성한다.
   * @param {*} db 
   */
  function initDB(db) {
    console.log("Schema.initDB");
    Object.keys(DB_COLUMNS).forEach(tableName => db.run(createTableSQL(tableName)));
  }

  /**
   * tableName 이름의 DB Table 생성.
   * @param {string} tableName DB_COLUMNS 키값에 있는 이름이어야 함
   */
  function createTableSQL(tableName, _columns = undefined) {
    let columns = _columns;
    if (columns == undefined) {
      columns = DB_COLUMNS[tableName];
      if (columns == undefined) return;
    }
    
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


  /************************/
  /*** TABLE SCHEMA 수정 ***/
  /************************/
  
  /**
   * 테이블을 재생성한 후 데이터를 복사한다.
   * 컬럼 순서를 재정렬하고 싶을 때 사용.
   * @param {*} db 
   * @param {string} tableName 
   */
  function recreateTable(db, tableName) {
    const columnsStr = Object.keys(DB_COLUMNS[tableName]).join(", ");
    console.log(columnsStr);
    
    db.run(createTableSQL(`${tableName}_new`, DB_COLUMNS[tableName]));
    db.run(`
      INSERT INTO ${tableName}_new (id, ${columnsStr})
      SELECT id, ${columnsStr}
      FROM ${tableName};
    `);
    deleteTable(db, tableName);
    changeTableName(db, `${tableName}_new`, tableName);
  }

  /**
   * 새로운 컬럼을 추가한다.
   * @param {*} db 
   * @param {*} tableName 
   * @param {*} columnName 
   * @param {*} dataType 
   * @param {*} defaultVal 
   */
  function addColumn(db, tableName, columnName, dataType, defaultVal = null) {
    db.run(`
      ALTER TABLE ${tableName}
      ADD COLUMN ${columnName} ${dataType};
    `);

    if (defaultVal) {
      db.run(`
        UPDATE ${tableName}
        SET ${columnName} = ?
        WHERE ${columnName} IS NULL;
      `, [defaultVal]);
    }
  }

  /**
   * 테이블 이름을 변경한다.
   * @param {*} db 
   * @param {*} tableName 
   * @param {*} newName 
   */
  function changeTableName(db, tableName, newName) {
    db.run(`ALTER TABLE ${tableName} RENAME TO ${newName}`);
  }

  /**
   * 컬럼 이름을 변경한다.
   * @param {*} db 
   * @param {*} tableName 
   * @param {*} columnName 
   * @param {*} newName 
   */
  function changeColumnName(db, tableName, columnName, newName) {
    db.run(`
      ALTER TABLE ${tableName}
      RENAME COLUMN ${columnName} TO ${newName}
    `);
  }

  /**
   * 테이블을 삭제한다.
   * @param {string} tableName 
   */
  function deleteTable(db, tableName) {
    db.run(`DROP TABLE ${tableName}`);
  }

  return {
    DB_COLUMNS,
    initDB,
  };
})();