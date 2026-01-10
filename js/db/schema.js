window.Schema = (function () {
  const DB_COLUMNS = {
    groups: {
      name:         "TEXT DEFAULT ''",
      subject:      "TEXT DEFAULT ''",
      teacher:      "TEXT DEFAULT ''",
      sub_teacher:  "TEXT DEFAULT ''",
      sub_subject:  "TEXT DEFAULT ''",
    },
    history: {
      table_name: "TEXT",
      row_id:     "INTEGER",
      field:      "TEXT -- name / subject / teacher / sub_teacher / sub_subject",
      old_value:  "TEXT",
      new_value:  "TEXT",
      changed_at: "TEXT",
    },
    group_schedules: {
      group_id:   "INTEGER NOT NULL",
      day:        "INTEGER DEFAULT 1 -- 0: 일 ~ 6: 토",
      start_time: "TEXT DEFAULT '13:00'",
      end_time:   "TEXT DEFAULT '23:00'"
    },
    students: {
      group_id:     "INTEGER",
      name:         "TEXT",
      school:       "TEXT",
      year:         "INTEGER",
      phone:        "TEXT",
      parent:       "TEXT",
      parent_phone: "TEXT",
      memo:         "TEXT",
    },
    plans: {
      group_id: "INTEGER",
      date:     "TEXT",
      lesson:   "TEXT",
      homework: "TEXT",
      exam:     "TEXT",
      notice:   "TEXT",
      memo:     "TEXT",
    },
    scores: {
      plan_id:        "INTEGER",
      student_id:     "INTEGER",
      homework_score: "TEXT",
      exam_score:     "INTEGER",
    },
    consults: {
      date:       "TEXT",
      student_id: "INTEGER",
      content:    "TEXT",
    },
  }

  /**
   * DB_COLUMNS에 적힌 스키마를 바탕으로
   * 기본 테이블들을 생성한다.
   * @param {*} db 
   */
  function initDB(db) {
    console.log("Schema.initDB");
    db.run(createSqlFromColumns("groups"));
    db.run(createSqlFromColumns("group_schedules"));
    db.run(createSqlFromColumns("students"));
    db.run(createSqlFromColumns("plans"));
    db.run(createSqlFromColumns("scores"));
    db.run(createSqlFromColumns("consults"));
    db.run(createSqlFromColumns("history"));
  }

  /**
   * tableName 이름의 DB가 존재하지 않는다면
   * columns 객체에 맞게 생성한다.
   */
  function createSqlFromColumns(tableName, _columns = undefined) {
    let columns = _columns;
    if (columns == undefined) {
      columns = DB_COLUMNS[tableName];
      if (columns == undefined) return;
    }

    const columnDefs = [];

    // 기본 PK
    columnDefs.push("id INTEGER PRIMARY KEY AUTOINCREMENT");

    for (const [name, type] of Object.entries(columns)) {
      columnDefs.push(`${name} ${type}`);
    }
    console.log("hello", tableName);
    return `
      CREATE TABLE IF NOT EXISTS ${tableName} (
      ${columnDefs.join(",\n")}
    )`;
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
    
    db.run(createSqlFromColumns(`${tableName}_new`, DB_COLUMNS[tableName]));
    db.run(`
      INSERT INTO ${tableName}_new (id, ${columnsStr})
      SELECT id, ${columnsStr}
      FROM ${tableName};
    `);
    db.run(`DROP TABLE ${tableName}`);
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

  return {
    initDB
  };
})();