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

    COLUMNS_WIDTH: {
      
    },
  };
})(window.App);
