window.DB = (function () {
  
  let db = null;

  /**********/
  /* DB 관련 */
  /**********/

  /**
   * 현재 DB를 localStorage에 저장한다.
   */
  function saveDB() {
    if (!db) return;
    const data = db.export();
    localStorage.setItem(DB_STORAGE_KEY, btoa(String.fromCharCode(...data)));
  }

  /**
   * localStorage로부터 DB를 로드하고
   * 현재 Schema에 맞도록 수정하고 다시 저장한다.
   * @returns {boolean} 로드 성공 여부
   */
  function loadDB() {
    const data = localStorage.getItem(DB_STORAGE_KEY);
    if (!data) return false;
    
    db = new SQL.Database(
      Uint8Array.from(atob(data), c => c.charCodeAt(0))
    );
    Schema.initDB(db);
    saveDB();
    console.log("DB.loadDB: DB 로드 성공");
    return true;
  }

  function createNewDB() {
    console.log("DB.createNewDB: 새로운 DB 생성");

    localStorage.removeItem(DB_STORAGE_KEY);
    db = new SQL.Database();
    Schema.initDB(db);
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

  /***********/
  /* 공통 함수 */
  /***********/

  /**
   * SQL 쿼리의 결과값을 object의 배열로 변환.
   * key: column명
   * value: 해당 column의 결과값
   * @param {*} result { columns: [...], values: [...] }
   * @returns [ {col: val, ...}, {...}, {...} ]
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

  /***********/
  /* GET 관련 */
  /***********/

  /**
   * groups 테이블의 모든 데이터
   * @returns {Group[]} [ {id, name, subject, ...} ]
   */
  function getAllGroups() {
    const res = db.exec(`
      SELECT * FROM groups
      ORDER BY name
    `);
    return resultToObjects(res[0]);
  }

  /**
   * 모든 그룹 스케줄 데이터
   * @returns {Schedule[]} [ {id, group_id, day, start_time, end_time} ]
   */
  function getAllSchedules() {
    const res = db.exec(`
    SELECT *
    FROM group_schedules
    ORDER BY group_id, day;
    `);
    return resultToObjects(res[0]);
  }

  function getStudentsByGroup(groupId) {
    const res = db.exec(
      "SELECT * FROM students WHERE group_id = ?",
      [groupId]
    );
    return resultToObjects(res[0]);
  }

  /**
   * 그룹의 정보 / 스케줄 / 학생 인원 수
   * @returns {[[Group, Schedule[], number]]}
   */
  function getGroupsWithSchedules() {
    const groups = getAllGroups();
    const schedules = getAllSchedules();

    if (!groups) return [];

    // scheduleMap[group_id]에 해당 그룹의 스케줄 array 만들기
    // scheduleMap[1] = [ {day, start_time, end_time}, {...}, {...} ]
    const scheduleMap = [];

    if (schedules) {
      schedules.forEach(sc => {
        if (!scheduleMap[sc.group_id]) {
          scheduleMap[sc.group_id] = [];
        }
        scheduleMap[sc.group_id].push(sc);
      });
    }

    return groups.map(group => 
      [
        group,
        scheduleMap[group.id] || [],
        getStudentsByGroup(group.id).length
      ]
    );
  }

  return {
    // DB
    saveDB,
    loadDB,
    createNewDB,
    backupDB,
    restoreDB,
    // GET
    getGroupsWithSchedules,
  };
})();