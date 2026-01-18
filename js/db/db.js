(function (App) {
  let SQL = null;
  let db = null;

  // ============================================================
  // DB 관련
  // ============================================================
  // #region

  /**
   * SQL을 초기화한다.
   * - 
   */
  async function initDB() {
    App.utils.logger.info("db.initDB: 시작");
    
    // 1. sql.js 엔진을 브라우저에 로딩해서 사용할 준비
    SQL = await initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });
    
    App.utils.logger.info("db.initDB: SQL 초기화 완료");

    // 2. localStorage에서 DB 데이터 가져오기
    const data = localStorage.getItem(App.utils.constants.DB_STORAGE_KEY);
    
    // 3. localStorage에 데이터가 없는 경우 새로 생성
    if (!data) {
      App.utils.logger.info("db.initDB: localStorage 데이터 없음. 새로 생성");
      createNewDB();
      return;
    }

    // 4. localStorage에 데이터가 있는 경우, db로 변환
    db = new SQL.Database(
      Uint8Array.from(atob(data), c => c.charCodeAt(0))
    );
    saveDB();
  }

  /**
   * 현재 DB를 localStorage에 저장한다.
   */
  function saveDB() {
    if (!db) return;
    const data = db.export();
    localStorage.setItem(App.utils.constants.DB_STORAGE_KEY, btoa(String.fromCharCode(...data)));
  }

  function createNewDB() {
    App.utils.logger.info("DB.createNewDB: 새로운 DB 생성");

    localStorage.removeItem(App.utils.constants.DB_STORAGE_KEY);
    db = new SQL.Database();

    // 테이블 생성
    console.log(App.db.schema);
    const tableSQLs = App.db.schema.getAllCreateTableSQL();
    tableSQLs.forEach(sql => db.run(sql));
    saveDB();
  }

  /**
   * DB를 localStorage에 저장 & 내 컴퓨터에 파일로 저장
   */
  function backupDB() {
    console.log("DB.backupDB");
    saveDB();
    const data = db.export(); // Uint8Array
    const blob = new Blob([data], { type: "application/octet-stream" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    const dateArr = new Date().toISOString().split(/-|T|:|\./).slice(0, 6);
    const date = dateArr.slice(0,3).join('');
    const time = dateArr.slice(3).join('');
    a.href = url;
    a.download = `${STRINGS.backup_filename}_${date}-${time}.sqlite`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * 파일을 불러와 읽고 DB를 local storage에 저장한다.
   */
  function restoreDB() {
    if (!confirm(STRINGS.db.confirmRestore)) return;

    // input 객체 만들고 파일 불러오면 db에 저장하기
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.addEventListener("change", function() {
      const file = this.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function () {
        const buffer = new Uint8Array(reader.result);

        db = new SQL.Database(buffer);
        saveDB(); // localStorage에 저장

        alert(STRINGS.db.successRestore);
        location.reload(); // 화면 갱신
      };
      reader.readAsArrayBuffer(file);
    })

    // 위에서 만든 input 객체 클릭
    fileInput.click();
  }

  // #endregion


  // ============================================================
  // TABLE 수정
  // ============================================================
  // #region
  
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

  // #endregion

  // ============================================================
  // 공통으로 사용하는 함수
  // ============================================================
  // #region

  /**
   * SQL 쿼리의 결과값을 object의 배열로 변환.
   * key: column명
   * value: 해당 column의 결과값
   * @param {*} result { columns: [...], values: [...] }
   * @returns Array({ column: value })
   */
  function resultToObjects(result) {
    if (!result || !result.columns || !result.values) return [];

    return result.values.map(row => {
      const obj = {};
      result.columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  }

  /**
   * 
   * @param {string} tablename 
   * @param {Object} options 
   * @returns 
   */
  function getRow(tablename, options) {
    const whereStr = Object.entries(options).map(([key, val]) => `${key} = "${val}"`).join(" AND ");
    const row = db.exec(`SELECT * FROM ${tablename} WHERE ${whereStr}`);
    return resultToObjects(row[0])[0];
  }

  function insertRow(tablename, data) {
    const columnsStr = Object.keys(data).join(", ");
    const valuesStr = Object.values(data).map(val => `"${val}"`).join(", ");
    
    db.run(`
      INSERT INTO ${tablename} (${columnsStr})
      VALUES (${valuesStr});
    `);
  }

  // #endregion

  // ============================================================
  // SEED (시드 데이터)
  // ============================================================

  function seed() {
    console.log("🌱 seed data inserting...");

    const sqls = [
      `INSERT INTO groups (id, created_at, name) VALUES ('1', '2025-11-03 00:00:00', '9E1');`, 
`INSERT INTO groups (id, created_at, name) VALUES ('2', '2025-11-03 00:00:00', '8E1');`, 
`INSERT INTO groups (id, created_at, name) VALUES ('3', '2025-11-03 00:00:00', '8S');`, 
`INSERT INTO groups (id, created_at, name) VALUES ('4', '2025-12-05 00:00:00', '7M1');`, 
`INSERT INTO groups (id, created_at, name) VALUES ('5', '2026-01-02 00:00:00', '경시대회');`, 
`INSERT INTO groups (id, created_at, name) VALUES ('6', '2026-01-05 00:00:00', '9M2');`, 
`INSERT INTO groups (id, created_at, name) VALUES ('7', '2026-01-15 00:00:00', '9M3');`, 
`INSERT INTO teachers (id, created_at, name) VALUES ('1', '2025-11-03 00:00:00', '함창수');`, 
`INSERT INTO teachers (id, created_at, name, memo) VALUES ('2', '2025-11-03 00:00:00', '김지영', '중등부 팀장');`, 
`INSERT INTO teachers (id, created_at, name) VALUES ('3', '2025-11-03 00:00:00', '정원재');`, 
`INSERT INTO teachers (id, created_at, name) VALUES ('4', '2025-11-03 00:00:00', '김도영');`, 
`INSERT INTO teachers (id, created_at, name, memo) VALUES ('5', '2025-11-03 00:00:00', '박범영', '팀장');`, 
`INSERT INTO group_teachers (id, created_at, group_id, teacher_id, role, memo) VALUES ('1', '2025-11-03 00:00:00', '1', '1', '담임', '미적분1 기본');`, 
`INSERT INTO group_teachers (id, created_at, group_id, teacher_id, role, memo) VALUES ('2', '2025-11-03 00:00:00', '1', '4', '부담임', '대수 심화');`, 
`INSERT INTO group_teachers (id, created_at, group_id, teacher_id, role, memo) VALUES ('3', '2025-11-03 00:00:00', '2', '1', '담임', '공통수학1 심화');`, 
`INSERT INTO group_teachers (id, created_at, group_id, teacher_id, role, memo) VALUES ('4', '2025-11-03 00:00:00', '2', '3', '부담임', '공통수학2 기본');`, 
`INSERT INTO group_teachers (id, created_at, group_id, teacher_id, role, memo) VALUES ('5', '2025-11-03 00:00:00', '3', '2', '담임', '미적분1 기본');`, 
`INSERT INTO group_teachers (id, created_at, group_id, teacher_id, role, memo) VALUES ('6', '2025-11-03 00:00:00', '3', '1', '부담임', '대수 심화');`, 
`INSERT INTO group_teachers (id, created_at, group_id, teacher_id, role, memo) VALUES ('7', '2025-12-05 00:00:00', '4', '2', '담임', '중2-1 기본');`, 
`INSERT INTO group_teachers (id, created_at, group_id, teacher_id, role, memo) VALUES ('8', '2025-12-05 00:00:00', '4', '1', '부담임', '중1-2 심화');`, 
`INSERT INTO group_teachers (id, created_at, group_id, teacher_id, role, memo) VALUES ('9', '2026-01-02 00:00:00', '5', '5', '담임', '경시 - 대수 관련');`, 
`INSERT INTO group_teachers (id, created_at, group_id, teacher_id, role, memo) VALUES ('10', '2026-01-02 00:00:00', '5', '1', '부담임', '경시 - 기하 관련');`, 
`INSERT INTO group_teachers (id, created_at, group_id, teacher_id, role, memo) VALUES ('11', '2026-01-05 00:00:00', '6', '2', '담임', '공통수학2 기본');`, 
`INSERT INTO group_teachers (id, created_at, group_id, teacher_id, role, memo) VALUES ('12', '2026-01-05 00:00:00', '6', '1', '부담임', '공통수학1 심화');`, 
`INSERT INTO group_teachers (id, created_at, group_id, teacher_id, role, memo) VALUES ('13', '2026-01-15 00:00:00', '7', '1', '담임', '중3-1 기본');`, 
`INSERT INTO group_teachers (id, created_at, group_id, teacher_id, role, memo) VALUES ('14', '2026-01-15 00:00:00', '7', '3', '부담임', '중3-1 기본 보조');`, 
`INSERT INTO schedules (id, created_at, group_id, teacher_id, day, start_time, end_time) VALUES ('1', '2025-11-03 00:00:00', '1', '1', '1', '17:20', '20:00');`, 
`INSERT INTO schedules (id, created_at, group_id, teacher_id, day, start_time, end_time) VALUES ('2', '2025-11-03 00:00:00', '1', '1', '3', '17:20', '20:00');`, 
`INSERT INTO schedules (id, created_at, group_id, teacher_id, day, start_time, end_time) VALUES ('3', '2025-11-03 00:00:00', '2', '1', '2', '17:20', '20:00');`, 
`INSERT INTO schedules (id, created_at, group_id, teacher_id, day, start_time, end_time) VALUES ('4', '2025-11-03 00:00:00', '2', '1', '4', '17:20', '20:00');`, 
`INSERT INTO schedules (id, created_at, group_id, teacher_id, day, start_time, end_time) VALUES ('5', '2025-11-03 00:00:00', '3', '1', '5', '20:10', '22:50');`, 
`INSERT INTO schedules (id, created_at, group_id, teacher_id, day, start_time, end_time) VALUES ('6', '2025-12-05 00:00:00', '4', '1', '5', '17:20', '20:00');`, 
`INSERT INTO schedules (id, created_at, group_id, teacher_id, day, start_time, end_time) VALUES ('7', '2026-01-02 00:00:00', '5', '1', '1', '20:10', '22:50');`, 
`INSERT INTO schedules (id, created_at, group_id, teacher_id, day, start_time, end_time) VALUES ('8', '2026-01-05 00:00:00', '6', '1', '3', '20:10', '22:50');`, 
`INSERT INTO schedules (id, created_at, group_id, teacher_id, day, start_time, end_time) VALUES ('9', '2026-01-15 00:00:00', '7', '1', '2', '20:10', '22:50');`, 
`INSERT INTO schedules (id, created_at, group_id, teacher_id, day, start_time, end_time) VALUES ('10', '2026-01-15 00:00:00', '7', '1', '4', '20:10', '22:50');`, 
`INSERT INTO students (id, created_at, name, school, grade, phone, parent) VALUES ('1', '2025-11-03 00:00:00', '정지영', '문정중', '중3', '010-2132-8061', '모');`, 
`INSERT INTO students (id, created_at, name, school, grade, parent, parent_phone) VALUES ('2', '2025-11-03 00:00:00', '이형건', '문정중', '중3', '모', '010-5126-7385');`, 
`INSERT INTO students (id, created_at, name, school, grade, parent, memo) VALUES ('3', '2025-11-03 00:00:00', '조안', '글꽃중', '중3', '모', '25/12/01~12 내신대비(22일 복귀)');`, 
`INSERT INTO students (id, created_at, name, school, grade, parent) VALUES ('4', '2025-11-03 00:00:00', '엄태이', '가양중', '중3', '모');`, 
`INSERT INTO students (id, created_at, name, school, grade, parent, parent_phone) VALUES ('5', '2025-11-03 00:00:00', '허지성', '삼천중', '중3', '모', '010-3674-4747');`, 
`INSERT INTO students (id, created_at, name, school, grade, phone, parent, parent_phone, memo) VALUES ('6', '2025-12-22 00:00:00', '도하빈', '보문중', '중3', '010-5641-6870', '부', '010-2403-8807(부)', '화목 영어학원 \n25/12/29~31 기말고사');`, 
`INSERT INTO students (id, created_at, name, school, grade, parent, parent_phone) VALUES ('7', '2025-11-03 00:00:00', '김소연', '둔산중', '중2', '모', '010-4440-9436');`, 
`INSERT INTO students (id, created_at, name, school, grade, parent, parent_phone) VALUES ('8', '2025-11-03 00:00:00', '서혜원', '전민중', '중2', '모', '010-7277-3532');`, 
`INSERT INTO students (id, created_at, name, school, grade, parent, parent_phone) VALUES ('9', '2025-11-03 00:00:00', '신유림', '삼천중', '중2', '모', '010-5004-1543');`, 
`INSERT INTO students (id, created_at, name, school, grade, parent, parent_phone) VALUES ('10', '2025-11-03 00:00:00', '이서윤', '문정중', '중2', '모', '010-9990-8965');`, 
`INSERT INTO students (id, created_at, name, school, grade, parent, parent_phone) VALUES ('11', '2025-11-03 00:00:00', '이시연', '문정중', '중2', '모', '010-7455-7997');`, 
`INSERT INTO students (id, created_at, name, school, grade, parent, parent_phone) VALUES ('12', '2025-11-03 00:00:00', '임동현', '삼천중', '중2', '모', '010-9364-9296');`, 
`INSERT INTO students (id, created_at, name, school, grade, parent, parent_phone) VALUES ('13', '2025-11-03 00:00:00', '장윤진', '삼천중', '중2', '모', '010-7997-8308');`, 
`INSERT INTO students (id, created_at, name, school, grade, parent, parent_phone) VALUES ('14', '2025-11-03 00:00:00', '최인제', '버드내중', '중2', '모', '010-6664-8116');`, 
`INSERT INTO students (id, created_at, name, school, grade, parent, parent_phone) VALUES ('15', '2026-01-06 00:00:00', '김한결', '탄방중', '중2', '모', '010-3471-3157');`, 
`INSERT INTO students (id, created_at, name, school, grade) VALUES ('16', '2025-11-03 00:00:00', '조아라', '문정중', '중2');`, 
`INSERT INTO students (id, created_at, name, school, grade) VALUES ('17', '2025-11-03 00:00:00', '김은승', '하기중', '중2');`, 
`INSERT INTO students (id, created_at, name, school, grade) VALUES ('18', '2025-11-03 00:00:00', '박시우', '대덕중', '중2');`, 
`INSERT INTO students (id, created_at, name, school, grade) VALUES ('19', '2025-12-05 00:00:00', '김지아', '갑천중', '중1');`, 
`INSERT INTO students (id, created_at, name, school, grade, memo) VALUES ('20', '2025-12-05 00:00:00', '우주환', '갑천중', '중1', '집중력 낮고 수업 중 말 많음. 핸드폰 몰래 사용하는 경우가 있음. 숙제 안해놓고 해왔다고 하는 경우 있음. 성취도는 중상. \n필기가 잘 안보이고 잘 안 하기도 함. 필기 점검 필수.\n주의를 단호하지만 과히지 않게 주는 게 좋음. \n부모님 모두 경찰직으로 엄격. 가정과의 연결이 필요할 경우, 전화보다는 채널이나 문자가 빠른듯…? 경찰 부모님이라는 특성상 ‘논리적, 간결하게’ 정리해서 연락하길 추천드림');`, 
`INSERT INTO students (id, created_at, name, school, grade, memo) VALUES ('21', '2025-12-05 00:00:00', '정승호', '삼천중', '중1', '조용. 자기 페이스 유지하는 스타일. 놀림 받아도 무던하게 넘김. 조용히 학습에 임하는 태도가 일관적. 과제 충실하게 해옴. 스스로 문제 해결했을 때 뿌듯. 계산실수 많음. 검산 습관 약한듯. 이해 여부가 잘 드러나지 않아 수업 중 확인 필수. 성취감 자주 느끼게 해주는 게 동기 유지에 중요한 타입.');`, 
`INSERT INTO students (id, created_at, name, school, grade, memo) VALUES ('22', '2025-12-05 00:00:00', '조선우', '관저중', '중1', '차분한 편. 자기주도학습 가능한 학생. 수업시간 딴짓 안하고 문제풀이 묵묵히 집중. 성취도 반에서 가장 뛰어남. 완벽주의적 성향이 있는 것 같음.\n어머니가 매우 꼼꼼히 학습 챙기심.\n중학 진학 후 내신 성적에 대한 불안이 높음(부모,학생 모두). 진학형 피드백을 적극적으로 주는 것이 매우 중요. 어머니께는 중등 내신 관리 시스템이 있다는 점을 구체적으로 안내해드리는 것이 신뢰 확보에 도움이 됨\n정서적 안정감 유지 필요. 긍정적 피드백 꾸준히 제공.');`, 
`INSERT INTO students (id, created_at, name, grade) VALUES ('23', '2026-01-16 00:00:00', '김규현', '중1');`, 
`INSERT INTO students (id, created_at, name, grade) VALUES ('24', '2026-01-16 00:00:00', '서지현', '중1');`, 
`INSERT INTO group_students (id, created_at, group_id, student_id) VALUES ('1', '2025-11-03 00:00:00', '1', '1');`, 
`INSERT INTO group_students (id, created_at, group_id, student_id) VALUES ('2', '2025-11-03 00:00:00', '1', '2');`, 
`INSERT INTO group_students (id, created_at, group_id, student_id) VALUES ('3', '2025-11-03 00:00:00', '1', '3');`, 
`INSERT INTO group_students (id, created_at, group_id, student_id) VALUES ('4', '2025-11-03 00:00:00', '1', '4');`, 
`INSERT INTO group_students (id, created_at, group_id, student_id) VALUES ('5', '2025-11-03 00:00:00', '1', '5');`, 
`INSERT INTO group_students (id, created_at, group_id, student_id) VALUES ('6', '2025-12-22 00:00:00', '1', '6');`, 
`INSERT INTO group_students (id, created_at, group_id, student_id) VALUES ('7', '2025-11-03 00:00:00', '2', '7');`, 
`INSERT INTO group_students (id, created_at, group_id, student_id) VALUES ('8', '2025-11-03 00:00:00', '2', '8');`, 
`INSERT INTO group_students (id, created_at, group_id, student_id) VALUES ('9', '2025-11-03 00:00:00', '2', '9');`, 
`INSERT INTO group_students (id, created_at, group_id, student_id) VALUES ('10', '2025-11-03 00:00:00', '2', '10');`, 
`INSERT INTO group_students (id, created_at, group_id, student_id) VALUES ('11', '2025-11-03 00:00:00', '2', '11');`, 
`INSERT INTO group_students (id, created_at, group_id, student_id) VALUES ('12', '2025-11-03 00:00:00', '2', '12');`, 
`INSERT INTO group_students (id, created_at, group_id, student_id) VALUES ('13', '2025-11-03 00:00:00', '2', '13');`, 
`INSERT INTO group_students (id, created_at, group_id, student_id) VALUES ('14', '2025-11-03 00:00:00', '2', '14');`, 
`INSERT INTO group_students (id, created_at, group_id, student_id) VALUES ('15', '2026-01-06 00:00:00', '2', '15');`, 
`INSERT INTO group_students (id, created_at, group_id, student_id) VALUES ('16', '2025-11-03 00:00:00', '3', '16');`, 
`INSERT INTO group_students (id, created_at, group_id, student_id) VALUES ('17', '2025-11-03 00:00:00', '3', '17');`, 
`INSERT INTO group_students (id, created_at, group_id, student_id) VALUES ('18', '2025-11-03 00:00:00', '3', '18');`, 
`INSERT INTO group_students (id, created_at, group_id, student_id) VALUES ('19', '2025-12-05 00:00:00', '4', '19');`, 
`INSERT INTO group_students (id, created_at, group_id, student_id) VALUES ('20', '2025-12-05 00:00:00', '4', '20');`, 
`INSERT INTO group_students (id, created_at, group_id, student_id) VALUES ('21', '2025-12-05 00:00:00', '4', '21');`, 
`INSERT INTO group_students (id, created_at, group_id, student_id) VALUES ('22', '2025-12-05 00:00:00', '4', '22');`, 
`INSERT INTO group_students (id, created_at, group_id, student_id) VALUES ('23', '2026-01-16 00:00:00', '4', '23');`, 
`INSERT INTO group_students (id, created_at, group_id, student_id) VALUES ('24', '2026-01-16 00:00:00', '4', '24');`
    ];

    sqls.forEach(sql => db.run(sql));
    saveDB();
    
    console.log("🌱 seed done");
  }

  // ============================================================
  // GET
  // ============================================================
  // #region

  function getAllGroups() {
    const groups = db.exec(`SELECT * FROM groups ORDER BY name`);
    return resultToObjects(groups[0]);
  }

  function getAllTeachers() {
    const teachers = db.exec(`SELECT * FROM teachers ORDER BY name`);
    return resultToObjects(teachers[0]);
  }

  function getTeacher(teacher_id) {
    return getRow("teachers", { id: teacher_id });
  }

  function getStudentsNumber(group_id) {
    const res = db.exec(`
      SELECT * FROM group_students
      WHERE group_id = ?
    `, [group_id]);
    return res[0]?.values.length | 0;
  }

  function getSchedulesByTeacher(teacher_id) {
    const schedules = db.exec(`
      SELECT *
      FROM schedules
      WHERE teacher_id = ?
      ORDER BY day, start_time
    `, [teacher_id]);
    return resultToObjects(schedules[0]);
  }

  /**
   * 해당 선생님이 담당하는 반 
   * @returns {{ group: Group, schedules: Schedule[] }[]}
   */
  function getGroupDetailsByTeacher(teacher_id) {
    /** @type {Group[]} */
    const groups = getAllGroups();
    /** @type {Schedule[]} */
    const schedules = getSchedulesByTeacher(teacher_id);
    /** @type {Teacher} */

    if (!groups) return [];

    /** @type {{ group: Group, schedules: Schedule[] }[]} */
    const groupDetails = [];

    groups.forEach(g => {
      groupDetails[g.id] = {
        group: g,
        schedules: [],
        number: getStudentsNumber(g.id)
      };
    });

    schedules.forEach(s => {
      groupDetails[s.group_id].schedules.push(s);
    });

    return groupDetails;
  }
  App.db = {
    ...App.db,
    // DB
    initDB,
    saveDB,
    createNewDB,
    backupDB,
    restoreDB,
    // SEED
    seed,
    // GET
    getAllTeachers,
    getTeacher,
    getGroupDetailsByTeacher,
  };
})(window.App);