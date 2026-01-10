window.DB = (function () {
  
  let db = null;

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

  return {
    saveDB,
    loadDB,
    createNewDB,
    backupDB,
    restoreDB,
  };
})();