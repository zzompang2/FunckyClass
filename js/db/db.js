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
    App.utils.logger.info("DB.saveDB: 저장");

    // spread operator로 인자를 너무 많이 넘겨서 스택이 터지는 것을 방지하기 위해
    // Blob + FileReader 사용.
    const data = db.export();
    const blob = new Blob([data], { type: "application/octet-stream" });
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      localStorage.setItem(
        App.utils.constants.DB_STORAGE_KEY,
        base64
      );
    };

    reader.readAsDataURL(blob);
  }

  /**
   * 새로운 DB 생성
   */
  function createNewDB() {
    App.utils.logger.info("DB.createNewDB: 새로운 DB 생성");

    localStorage.removeItem(App.utils.constants.DB_STORAGE_KEY);
    db = new SQL.Database();

    // 테이블 생성
    console.log(App.db.schema);
    const tableSQLs = App.db.schema.getAllCreateTableSQL();
    tableSQLs.forEach(sql => db.run(sql));
    App.utils.logger.info("createNewDB: seed 데이터 넣기");
    seed();
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
    a.download = `${App.utils.constants.BACKUP_FILENAME}_${date}-${time}.sqlite`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * 파일을 불러와 읽고 DB를 local storage에 저장한다.
   */
  function restoreDB() {
    if (!confirm(App.utils.constants.DB_MESSAGE.confirmRestore)) return;

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

        alert(App.utils.constants.DB_MESSAGE.successRestore);
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
    const tableAlias = App.utils.constants.TABLE_ALIAS[tablename];
    const fieldStr = tableAlias + '.id,' + Object.keys(App.db.schema.DB_COLUMNS[tablename])
    .filter(f => !f.startsWith("__")).map(f => `${tableAlias}.${f}`).join(",");
    const fields = formatFieldWithAlias(fieldStr);
    const whereStr = Object.entries(options).map(([key, val]) => `${key} = "${val}"`).join(" AND ");
    const row = db.exec(`SELECT ${fields} FROM ${tablename} AS ${tableAlias} WHERE ${whereStr}`);
    return resultToObjects(row[0])[0];
  }

  function formatFieldWithAlias(fieldStr) {
    const fields = fieldStr.replace(/\s/g,"").split(',');
    return fields.map(f => `${f} AS ${App.utils.constants.FIELD_ALIAS[f]}`).join(',\n  ');
  }

  // #endregion

  // ============================================================
  // SEED (시드 데이터)
  // ============================================================

  function seed() {
    console.log("🌱 seed data inserting...");
    insert("groups", "id, created_at, name", "'1', '2025-11-03 00:00:00', '9E1'");
    insert("groups", "id, created_at, name", "'2', '2025-11-03 00:00:00', '8E1'");
    insert("groups", "id, created_at, name", "'3', '2025-11-03 00:00:00', '8S'");
    insert("groups", "id, created_at, name", "'4', '2025-12-05 00:00:00', '7M1'");
    insert("groups", "id, created_at, name", "'5', '2026-01-02 00:00:00', '경시대회'");
    insert("groups", "id, created_at, name", "'6', '2026-01-05 00:00:00', '9M2'");
    insert("groups", "id, created_at, name", "'7', '2026-01-15 00:00:00', '9M3'");
    insert("teachers", "id, created_at, name, gender, state", "'1', '2025-11-03 00:00:00', '함창수', 'man', 'active'");
    insert("teachers", "id, created_at, name, gender, state, memo", "'2', '2025-11-03 00:00:00', '김지영', 'woman', 'active', '중등부 팀장'");
    insert("teachers", "id, created_at, name, gender, state", "'3', '2025-11-03 00:00:00', '정원재', 'man', 'active'");
    insert("teachers", "id, created_at, name, gender, state", "'4', '2025-11-03 00:00:00', '김도영', 'woman', 'active'");
    insert("teachers", "id, created_at, name, gender, state, memo", "'5', '2025-11-03 00:00:00', '박범영', 'man', 'active', '팀장'");
    insert("group_teachers", "id, created_at, group_id, teacher_id, role, subject", "'1', '2025-11-03 00:00:00', '1', '1', 'main', '미적분1 기본'");
    insert("group_teachers", "id, created_at, group_id, teacher_id, role, subject", "'2', '2025-11-03 00:00:00', '1', '4', 'sub', '대수 심화'");
    insert("group_teachers", "id, created_at, group_id, teacher_id, role, subject", "'3', '2025-11-03 00:00:00', '2', '1', 'main', '공통수학1 심화'");
    insert("group_teachers", "id, created_at, group_id, teacher_id, role, subject", "'4', '2025-11-03 00:00:00', '2', '3', 'sub', '공통수학2 기본'");
    insert("group_teachers", "id, created_at, group_id, teacher_id, role, subject", "'5', '2025-11-03 00:00:00', '3', '2', 'main', '미적분1 기본'");
    insert("group_teachers", "id, created_at, group_id, teacher_id, role, subject", "'6', '2025-11-03 00:00:00', '3', '1', 'sub', '대수 심화'");
    insert("group_teachers", "id, created_at, group_id, teacher_id, role, subject", "'7', '2025-12-05 00:00:00', '4', '2', 'main', '중2-1 기본'");
    insert("group_teachers", "id, created_at, group_id, teacher_id, role, subject", "'8', '2025-12-05 00:00:00', '4', '1', 'sub', '중1-2 심화'");
    insert("group_teachers", "id, created_at, group_id, teacher_id, role, subject", "'9', '2026-01-02 00:00:00', '5', '5', 'main', '경시 - 대수 관련'");
    insert("group_teachers", "id, created_at, group_id, teacher_id, role, subject", "'10', '2026-01-02 00:00:00', '5', '1', 'sub', '경시 - 기하 관련'");
    insert("group_teachers", "id, created_at, group_id, teacher_id, role, subject", "'11', '2026-01-05 00:00:00', '6', '2', 'main', '공통수학2 기본'");
    insert("group_teachers", "id, created_at, group_id, teacher_id, role, subject", "'12', '2026-01-05 00:00:00', '6', '1', 'sub', '공통수학1 심화'");
    insert("group_teachers", "id, created_at, group_id, teacher_id, role, subject", "'13', '2026-01-15 00:00:00', '7', '1', 'main', '중3-1 기본'");
    insert("group_teachers", "id, created_at, group_id, teacher_id, role, subject", "'14', '2026-01-15 00:00:00', '7', '3', 'sub', '중3-1 기본 보조'");
    insert("schedules", "id, created_at, group_id, teacher_id, day, start_time, end_time", "'1', '2025-11-03 00:00:00', '1', '1', '1', '17:20', '20:00'");
    insert("schedules", "id, created_at, group_id, teacher_id, day, start_time, end_time", "'2', '2025-11-03 00:00:00', '1', '1', '3', '17:20', '20:00'");
    insert("schedules", "id, created_at, group_id, teacher_id, day, start_time, end_time", "'3', '2025-11-03 00:00:00', '2', '1', '2', '17:20', '20:00'");
    insert("schedules", "id, created_at, group_id, teacher_id, day, start_time, end_time", "'4', '2025-11-03 00:00:00', '2', '1', '4', '17:20', '20:00'");
    insert("schedules", "id, created_at, group_id, teacher_id, day, start_time, end_time", "'5', '2025-11-03 00:00:00', '3', '1', '5', '20:10', '22:50'");
    insert("schedules", "id, created_at, group_id, teacher_id, day, start_time, end_time", "'6', '2025-12-05 00:00:00', '4', '1', '5', '17:20', '20:00'");
    insert("schedules", "id, created_at, group_id, teacher_id, day, start_time, end_time", "'7', '2026-01-02 00:00:00', '5', '1', '1', '20:10', '22:50'");
    insert("schedules", "id, created_at, group_id, teacher_id, day, start_time, end_time", "'8', '2026-01-05 00:00:00', '6', '1', '3', '20:10', '22:50'");
    insert("schedules", "id, created_at, group_id, teacher_id, day, start_time, end_time", "'9', '2026-01-15 00:00:00', '7', '1', '2', '20:10', '22:50'");
    insert("schedules", "id, created_at, group_id, teacher_id, day, start_time, end_time", "'10', '2026-01-15 00:00:00', '7', '1', '4', '20:10', '22:50'");
    insert("students", "id, created_at, name, gender, school, grade, phone, parent, state", "'1', '2025-11-03 00:00:00', '정지영', 'man', '문정중', '중3', '010-2132-8061', '모', 'active'");
    insert("students", "id, created_at, name, gender, school, grade, parent, parent_phone, state", "'2', '2025-11-03 00:00:00', '이형건', 'man', '문정중', '중3', '모', '010-5126-7385', 'active'");
    insert("students", "id, created_at, name, gender, school, grade, parent, state, memo", "'3', '2025-11-03 00:00:00', '조안', 'man', '글꽃중', '중3', '모', 'active', '25/12/01~12 내신대비(22일 복귀)'");
    insert("students", "id, created_at, name, gender, school, grade, parent, state", "'4', '2025-11-03 00:00:00', '엄태이', 'man', '가양중', '중3', '모', 'active'");
    insert("students", "id, created_at, name, gender, school, grade, parent, parent_phone, state", "'5', '2025-11-03 00:00:00', '허지성', 'man', '삼천중', '중3', '모', '010-3674-4747', 'active'");
    insert("students", "id, created_at, name, gender, school, grade, phone, parent, parent_phone, state, memo", "'6', '2025-12-22 00:00:00', '도하빈', 'man', '보문중', '중3', '010-5641-6870', '부', '010-2403-8807(부)', 'active', '화목 영어학원 \n25/12/29~31 기말고사'");
    insert("students", "id, created_at, name, gender, school, grade, parent, parent_phone, state", "'7', '2025-11-03 00:00:00', '김소연', 'woman', '둔산중', '중2', '모', '010-4440-9436', 'active'");
    insert("students", "id, created_at, name, gender, school, grade, parent, parent_phone, state", "'8', '2025-11-03 00:00:00', '서혜원', 'woman', '전민중', '중2', '모', '010-7277-3532', 'active'");
    insert("students", "id, created_at, name, gender, school, grade, parent, parent_phone, state", "'9', '2025-11-03 00:00:00', '신유림', 'woman', '삼천중', '중2', '모', '010-5004-1543', 'active'");
    insert("students", "id, created_at, name, gender, school, grade, parent, parent_phone, state", "'10', '2025-11-03 00:00:00', '이서윤', 'woman', '문정중', '중2', '모', '010-9990-8965', 'active'");
    insert("students", "id, created_at, name, gender, school, grade, parent, parent_phone, state", "'11', '2025-11-03 00:00:00', '이시연', 'woman', '문정중', '중2', '모', '010-7455-7997', 'active'");
    insert("students", "id, created_at, name, gender, school, grade, parent, parent_phone, state", "'12', '2025-11-03 00:00:00', '임동현', 'man', '삼천중', '중2', '모', '010-9364-9296', 'active'");
    insert("students", "id, created_at, name, gender, school, grade, parent, parent_phone, state", "'13', '2025-11-03 00:00:00', '장윤진', 'woman', '삼천중', '중2', '모', '010-7997-8308', 'active'");
    insert("students", "id, created_at, name, gender, school, grade, parent, parent_phone, state", "'14', '2025-11-03 00:00:00', '최인제', 'man', '버드내중', '중2', '모', '010-6664-8116', 'active'");
    insert("students", "id, created_at, name, gender, school, grade, parent, parent_phone, state", "'15', '2026-01-06 00:00:00', '김한결', 'man', '탄방중', '중2', '모', '010-3471-3157', 'active'");
    insert("students", "id, created_at, name, gender, school, grade, state", "'16', '2025-11-03 00:00:00', '조아라', 'woman', '문정중', '중2', 'active'");
    insert("students", "id, created_at, name, gender, school, grade, state", "'17', '2025-11-03 00:00:00', '김은승', 'woman', '하기중', '중2', 'active'");
    insert("students", "id, created_at, name, gender, school, grade, state", "'18', '2025-11-03 00:00:00', '박시우', 'man', '대덕중', '중2', 'active'");
    insert("students", "id, created_at, name, gender, school, grade, state", "'19', '2025-12-05 00:00:00', '김지아', 'woman', '갑천중', '중1', 'active'");
    insert("students", "id, created_at, name, gender, school, grade, state, memo", "'20', '2025-12-05 00:00:00', '우주환', 'man', '갑천중', '중1', 'active', '집중력 낮고 수업 중 말 많음. 핸드폰 몰래 사용하는 경우가 있음. 숙제 안해놓고 해왔다고 하는 경우 있음. 성취도는 중상. \n필기가 잘 안보이고 잘 안 하기도 함. 필기 점검 필수.\n주의를 단호하지만 과히지 않게 주는 게 좋음. \n부모님 모두 경찰직으로 엄격. 가정과의 연결이 필요할 경우, 전화보다는 채널이나 문자가 빠른듯…? 경찰 부모님이라는 특성상 ‘논리적, 간결하게’ 정리해서 연락하길 추천드림'");
    insert("students", "id, created_at, name, gender, school, grade, state, memo", "'21', '2025-12-05 00:00:00', '정승호', 'man', '삼천중', '중1', 'active', '조용. 자기 페이스 유지하는 스타일. 놀림 받아도 무던하게 넘김. 조용히 학습에 임하는 태도가 일관적. 과제 충실하게 해옴. 스스로 문제 해결했을 때 뿌듯. 계산실수 많음. 검산 습관 약한듯. 이해 여부가 잘 드러나지 않아 수업 중 확인 필수. 성취감 자주 느끼게 해주는 게 동기 유지에 중요한 타입.'");
    insert("students", "id, created_at, name, gender, school, grade, state, memo", "'22', '2025-12-05 00:00:00', '조선우', 'man', '관저중', '중1', 'active', '차분한 편. 자기주도학습 가능한 학생. 수업시간 딴짓 안하고 문제풀이 묵묵히 집중. 성취도 반에서 가장 뛰어남. 완벽주의적 성향이 있는 것 같음.\n어머니가 매우 꼼꼼히 학습 챙기심.\n중학 진학 후 내신 성적에 대한 불안이 높음(부모,학생 모두). 진학형 피드백을 적극적으로 주는 것이 매우 중요. 어머니께는 중등 내신 관리 시스템이 있다는 점을 구체적으로 안내해드리는 것이 신뢰 확보에 도움이 됨\n정서적 안정감 유지 필요. 긍정적 피드백 꾸준히 제공.'");
    insert("students", "id, created_at, name, gender, grade, state", "'23', '2026-01-16 00:00:00', '김규현', 'man', '중1', 'active'");
    insert("students", "id, created_at, name, gender, grade, state", "'24', '2026-01-16 00:00:00', '서지현', 'woman', '중1', 'active'");
    insert("group_students", "id, created_at, group_id, student_id", "'1', '2025-11-03 00:00:00', '1', '1'");
    insert("group_students", "id, created_at, group_id, student_id", "'2', '2025-11-03 00:00:00', '1', '2'");
    insert("group_students", "id, created_at, group_id, student_id", "'3', '2025-11-03 00:00:00', '1', '3'");
    insert("group_students", "id, created_at, group_id, student_id", "'4', '2025-11-03 00:00:00', '1', '4'");
    insert("group_students", "id, created_at, group_id, student_id", "'5', '2025-11-03 00:00:00', '1', '5'");
    insert("group_students", "id, created_at, group_id, student_id", "'6', '2025-12-22 00:00:00', '1', '6'");
    insert("group_students", "id, created_at, group_id, student_id", "'7', '2025-11-03 00:00:00', '2', '7'");
    insert("group_students", "id, created_at, group_id, student_id", "'8', '2025-11-03 00:00:00', '2', '8'");
    insert("group_students", "id, created_at, group_id, student_id", "'9', '2025-11-03 00:00:00', '2', '9'");
    insert("group_students", "id, created_at, group_id, student_id", "'10', '2025-11-03 00:00:00', '2', '10'");
    insert("group_students", "id, created_at, group_id, student_id", "'11', '2025-11-03 00:00:00', '2', '11'");
    insert("group_students", "id, created_at, group_id, student_id", "'12', '2025-11-03 00:00:00', '2', '12'");
    insert("group_students", "id, created_at, group_id, student_id", "'13', '2025-11-03 00:00:00', '2', '13'");
    insert("group_students", "id, created_at, group_id, student_id", "'14', '2025-11-03 00:00:00', '2', '14'");
    insert("group_students", "id, created_at, group_id, student_id", "'15', '2026-01-06 00:00:00', '2', '15'");
    insert("group_students", "id, created_at, group_id, student_id", "'16', '2025-11-03 00:00:00', '3', '16'");
    insert("group_students", "id, created_at, group_id, student_id", "'17', '2025-11-03 00:00:00', '3', '17'");
    insert("group_students", "id, created_at, group_id, student_id", "'18', '2025-11-03 00:00:00', '3', '18'");
    insert("group_students", "id, created_at, group_id, student_id", "'19', '2025-12-05 00:00:00', '4', '19'");
    insert("group_students", "id, created_at, group_id, student_id", "'20', '2025-12-05 00:00:00', '4', '20'");
    insert("group_students", "id, created_at, group_id, student_id", "'21', '2025-12-05 00:00:00', '4', '21'");
    insert("group_students", "id, created_at, group_id, student_id", "'22', '2025-12-05 00:00:00', '4', '22'");
    insert("group_students", "id, created_at, group_id, student_id", "'23', '2026-01-16 00:00:00', '4', '23'");
    insert("group_students", "id, created_at, group_id, student_id", "'24', '2026-01-16 00:00:00', '4', '24'");
    insert("plans", "id, created_at, group_id, date, lesson, homework, exam, notice", "'1', '2025-11-22 00:00:00', '1', '2025-11-22', '11/22 계획표', '11/22 숙제', '11/22 시험', '11/22 공지사항'");
    insert("plans", "id, created_at, group_id, date, memo, lesson, homework, notice", "'2', '2025-11-24 00:00:01', '1', '2025-11-24', '000 여행', '11/24 계획표', '11/24 숙제', '11/24 공지사항'");
    insert("plans", "id, created_at, group_id, date, lesson, homework, exam", "'3', '2025-11-25 00:00:02', '1', '2025-11-25', '11/25 계획표', '11/25 숙제', '11/25 시험'");
    insert("plans", "id, created_at, group_id, date, lesson, homework, exam, notice", "'4', '2025-11-27 00:00:03', '1', '2025-11-27', '11/27 계획표', '11/27 숙제', '11/27 시험', '11/27 공지사항'");
    insert("plans", "id, created_at, group_id, date, lesson, homework, notice", "'5', '2025-11-28 00:00:04', '1', '2025-11-28', '11/28 계획표', '11/28 숙제', '11/28 공지사항'");
    
    console.log("🌱 seed done");
  }

  // ============================================================
  // INSERT, UPDATE
  // ============================================================
  // #region

  const recordedTable = ['groups', 'teachers', 'group_teachers', 'schedules', 'students', 'group_students'];

  function insert(table, fields, values) {
    db.run(`INSERT INTO ${table} (${fields}) VALUES (${values});`);
    
    if (!recordedTable.includes(table)) return;

    const id = db.exec(`SELECT last_insert_rowid()`)[0].values[0][0];
    const newRow = getRow(table, {id: id});

    const changed_fields = Object.keys(newRow);
    
    changed_fields.forEach(field => {
      db.run(`
        INSERT INTO update_logs (table_name, record_id, action, changed_field, before_value, after_value)
        VALUES (?, ?, 'INSERT', ?, '', ?);
      `, [ table, id, field, newRow[field] ]);
    });
  }

  function update(table, id, column, value) {
    App.utils.logger.debug(`db.update: \ntable(${table}), id(${id}), column(${column}), value(${value})`);

    const row = db.exec(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    const beforeValue = resultToObjects(row[0])[0];
    db.run(`UPDATE ${table} SET ${column}=? WHERE id=?`, [value, id]);
    db.run(`
      INSERT INTO update_logs (table_name, record_id, action, changed_field, before_value, after_value)
      VALUES (?, ?, 'UPDATE', ?, ?, ?);
    `, [ table, id, column, beforeValue[column], value ]);
  }

  // #endregion

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

  function getAllSchedules() {
    const res = db.exec(`
      SELECT g.id, sc.day, sc.start_time, sc.end_time, g.name, gt.subject
      FROM groups g
      LEFT JOIN schedules sc ON g.id = sc.group_id
      JOIN group_teachers gt
        ON gt.group_id = g.id
        AND gt.teacher_id = sc.teacher_id
      WHERE sc.teacher_id = ?
      ORDER BY g.id, sc.day;
    `, [App.state.currentTeacherId]);
    return resultToObjects(res[0]);
  }

  function getGroup(group_id) {
    const fields = formatFieldWithAlias('g.id, g.name, g.memo');

    const row = db.exec(`
      SELECT ${fields}
      FROM groups g
      WHERE g.id = ?
    `, [group_id]);

    return resultToObjects(row[0])[0];
  }

  function getTeacher(teacher_id) {
    return getRow("teachers", { id: teacher_id });
  }

  function getStudent(student_id) {
    return getRow("students", { id: student_id });
  }

  function getPlan(plan_id) {
    return getRow("plans", { id: plan_id });
  }

  function getStudentRecord(plan_id, student_id) {
    const fields = formatFieldWithAlias(`
      p.date, p.lesson, p.homework, p.exam, p.notice,
      re.lesson, re.homework, re.exam, re.notice,
      re.attendance, re.homework_score, re.exam_score, re.feedback`);

    const res = db.exec(`
      SELECT ${fields}
      FROM student_records re
      JOIN plans p
        ON p.id = re.plan_id
      WHERE re.plan_id = ?
      AND re.student_id = ?
    `, [plan_id, student_id]);

    return resultToObjects(res[0])[0];
  }

  function getTeachersByGroup(group_id) {
    const fields = formatFieldWithAlias('t.id, t.name, t.gender, t.state, t.memo, gt.id, gt.role, gt.subject');

    const row = db.exec(`
      SELECT ${fields}
      FROM group_teachers gt
      LEFT JOIN teachers t ON gt.teacher_id = t.id
      WHERE gt.group_id = ?
      ORDER BY
        CASE gt.role
          WHEN 'main' THEN 1
          WHEN 'sub' THEN 2
          ELSE 3
        END
    `, [group_id]);

    return resultToObjects(row[0]);
  }

  function getStudentsNumber(group_id) {
    const res = db.exec(`
      SELECT * FROM group_students
      WHERE group_id = ?
    `, [group_id]);
    return res[0]?.values.length | 0;
  }

  function getSchedulesByGroup(group_id) {
    const fields = formatFieldWithAlias('sc.id, sc.teacher_id, sc.day, sc.start_time, sc.end_time');

    const row = db.exec(`
      SELECT ${fields}
      FROM schedules AS sc
      WHERE group_id = ?
      ORDER BY day, start_time
    `, [group_id]);

    return resultToObjects(row[0]);
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
   * 해당 선생님이 담당하는 반 정보
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

  /**
   * 
   * @param {number} groupId 
   * @returns {
   *   student_id, student_name,
   *   student_gender, student_school,
   *   student_grade, student_phone,
   *   student_parent, student_parent_phone,
   *   student_state, student_memo
   * }
   */
  function getStudentsByGroup(groupId) {
    const fields = formatFieldWithAlias(`
      st.id, st.name, st.gender, st.school, st.grade, st.created_at,
      st.phone, st.parent, st.parent_phone, st.state, st.memo`);

    const res = db.exec(`
      SELECT ${fields}
      FROM students AS st
      JOIN group_students as gs ON gs.group_id = ?
      WHERE gs.student_id = st.id
      ORDER BY name`,
      [groupId]
    );
    return resultToObjects(res[0]);
  }

  function getUpdateLogsByGroup(groupId) {
    const fields = formatFieldWithAlias(`
      ul.id, ul.updated_at, ul.action, ul.changed_field,
      ul.before_value, ul.after_value`);

    const res = db.exec(`
      SELECT ${fields}
      FROM update_logs AS ul
      WHERE table_name = 'groups'
      AND record_id = ?
      ORDER BY updated_at`,
      [groupId]
    );

    return resultToObjects(res[0]);
  }

  /**
   * groupId의 모든 계획 데이터 (날짜순)
   * @param {number} groupId 
   * @returns {Plan[]}
   */
  function getPlansByGroup(groupId) {
    const fields = formatFieldWithAlias(`
      p.id, p.group_id, p.date, p.memo,
      p.lesson, p.homework, p.exam, p.notice`);

    const res = db.exec(`
      SELECT ${fields}
      FROM plans AS p
      WHERE group_id = ?
      ORDER BY (date IS '') DESC, date DESC`,
      [groupId]
    );
    return resultToObjects(res[0]);
  }

  function getCurAndPrevPlans(planId) {
    const fields = formatFieldWithAlias(`
      p.id, p.group_id, p.date, p.memo,
      p.lesson, p.homework, p.exam, p.notice`);

    const res = db.exec(`
      SELECT ${fields}
      FROM plans p2
      JOIN plans p
        ON p.group_id = p2.group_id
      AND p.date <= p2.date
      WHERE p2.id = ?
      ORDER BY p.date DESC
      LIMIT 2;
    `, [planId]);

    return resultToObjects(res[0]);
  }

  function getStudentRecords(planId) {
    const fields = formatFieldWithAlias(`
      st.id, re.id, re.lesson, re.homework, re.exam, re.notice, re.attendance,
      re.homework_score, re.exam_score, re.feedback, re.memo`);

    const res = db.exec(`
      SELECT ${fields}
      FROM plans p
      JOIN group_students gs
        ON gs.group_id = p.group_id
      JOIN students st
        ON st.id = gs.student_id
      JOIN student_records re
        ON re.plan_id = p.id
        AND re.student_id = st.id
      WHERE p.id = ?
      ORDER BY st.name;
    `, [planId]);

    return resultToObjects(res[0]);
  }

  function getConsultsByGroup(groupId) {
    const fields = formatFieldWithAlias(`
      co.id, co.date, co.student_id, st.name, co.target, co.content
    `);

    const res = db.exec(`
      SELECT ${fields}
      FROM consults co
      JOIN group_students gs
        ON gs.student_id = co.student_id
      JOIN students st
        ON st.id = co.student_id
      WHERE gs.group_id = ?
      ORDER BY (co.date IS '') DESC, co.date DESC`,
      [groupId]
    );
    return resultToObjects(res[0]);
  }

  function getConsultsByStudent(studentId) {
    const fields = formatFieldWithAlias(`
      co.id, co.date, co.student_id, st.name, co.target, co.content
    `);

    const res = db.exec(`
      SELECT ${fields}
      FROM consults co
      JOIN students st
        ON st.id = co.student_id
      WHERE co.student_id = ?
      ORDER BY (co.date IS '') DESC, co.date DESC`,
      [studentId]
    );
    return resultToObjects(res[0]);
  }

  // #endregion

  // ============================================================
  // ADD
  // ============================================================
  // #region

  /**
   * 
   * @param {number} groupId 
   * @param {string} date 
   * @param {string} lesson 
   * @param {string} homework 
   * @param {string} exam 
   */
  function addPlan(groupId, value = {date: '', memo: '', lesson: '', homework: '', notice: ''}) {
    db.run(`
      INSERT INTO plans (group_id, date, memo, lesson, homework, notice)
      VALUES (?, ?, ?, ?, ?, ?)
      `,[
        groupId, value.date, value.memo, value.lesson, value.homework, value.notice
      ]
    );
  }

  function addStudentRecord(planId, studentId) {
    const res = db.exec(`
      INSERT INTO student_records (plan_id, student_id)
      VALUES (?, ?)
      RETURNING *
    `, [ planId, studentId ]);

    return resultToObjects(res[0])[0];
  }

  function addConsult(studentId) {
    db.run(`
      INSERT INTO consults (date, student_id, target)
      VALUES (?, ?, ?)
    `, [ App.utils.date.getTodayDate(), studentId, 'parent' ]);
  }

  // #endregion

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
    // INSERT, UPDATE
    update,
    // GET
    getAllTeachers,
    getAllSchedules,
    getGroup,
    getTeacher,
    getStudent,
    getPlan,
    getStudentRecord,
    getTeachersByGroup,
    getGroupDetailsByTeacher,
    getSchedulesByGroup,
    getStudentsByGroup,
    getUpdateLogsByGroup,
    getPlansByGroup,
    getCurAndPrevPlans,
    getStudentRecords,
    getConsultsByGroup,
    getConsultsByStudent,
    // ADD
    addPlan,
    addStudentRecord,
    addConsult,
  };
})(window.App);