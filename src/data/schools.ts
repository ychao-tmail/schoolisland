export type SchoolLevel = "elementary" | "junior";

export type SchoolDistrict = "北津河畔" | "舊城核心" | "東區文教" | "南區縣政";

export interface SchoolMilestone {
  year: string;
  title: string;
  detail: string;
}

export interface SchoolQuiz {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface SchoolInfo {
  id: string;
  name: string;
  shortName: string;
  level: SchoolLevel;
  district: SchoolDistrict;
  founded: number;
  address: string;
  coords: {
    lat: number;
    lng: number;
  };
  groundColor: number;
  accentColor: number;
  cliffColor: number;
  tagline: string;
  description: string;
  highlights: string[];
  milestones: SchoolMilestone[];
  landmarkType:
    | "castle"
    | "solar"
    | "gears"
    | "science"
    | "slides"
    | "moat"
    | "courtyard"
    | "pool"
    | "gym"
    | "theater"
    | "paddy"
    | "bilingual"
    | "bodhi";
  quiz: SchoolQuiz;
}

export interface BridgeSpec {
  from: string;
  to: string;
  style: "river" | "oldtown" | "greenway" | "timber";
  label?: string;
}

/**
 * 宜蘭市公辦 13 所國民中小學（9 所國小 + 4 所國中）
 * coords 為對應 Google 地圖實際 WGS84 經緯度位置，3D 場景將依此方位與比例自動投影配置。
 */
export const YILAN_SCHOOLS: SchoolInfo[] = [
  {
    id: "xinsheng-es",
    name: "宜蘭縣立新生國民小學",
    shortName: "新生國小",
    level: "elementary",
    district: "北津河畔",
    founded: 1961,
    address: "宜蘭市大坡路一段 100 號",
    coords: { lat: 24.7713, lng: 121.7543 },
    groundColor: 0xd9cbb8,
    accentColor: 0xd97757,
    cliffColor: 0x9c826b,
    tagline: "宜蘭河北岸的歐式童話城堡校園",
    description:
      "位於宜蘭河北岸、鄰近北津社區，以色彩繽紛的歐式尖塔城堡校舍聞名，並曾結合國際英語村體驗資源，培養孩子羽球、管樂與自信展能的舞台。",
    highlights: ["歐式童話尖塔校舍", "國際英語村基地", "羽球與管樂社團", "北津磚窯社區共學"],
    milestones: [
      {
        year: "1961",
        title: "設立力行國小新生分班",
        detail: "為解決宜蘭河北岸新店仔與磚窯社區學童遠渡河岸就學的不便，於新生派出所後方設置分班。",
      },
      {
        year: "1963",
        title: "遷入大坡路現址",
        detail: "地方仕紳奔走覓得大坡路一段校地並完成初期校舍，升格為力行國小新生分校。",
      },
      {
        year: "1964",
        title: "奉准獨立設校",
        detail: "正式獨立命名為「宜蘭縣宜蘭市新生國民學校」，並於 1968 年配合九年國教改制為新生國小。",
      },
      {
        year: "2008",
        title: "設立宜蘭國際英語村",
        detail: "建置全縣指標性的情境式英語學習空間，結合城堡外觀成為北津河畔特色校園。",
      },
    ],
    landmarkType: "castle",
    quiz: {
      question: "新生國小位於宜蘭市的哪一側，校舍以什麼外觀聞名？",
      options: ["宜蘭河北岸・歐式童話城堡", "縣政中心南側・三合院", "火車站旁・鐵道倉庫"],
      answerIndex: 0,
      explanation: "新生國小坐落於宜蘭河北岸大坡路一帶，鮮明可愛的歐式尖塔城堡建築是它最鮮明的地標。",
    },
  },
  {
    id: "lixing-es",
    name: "宜蘭縣立力行國民小學",
    shortName: "力行國小",
    level: "elementary",
    district: "北津河畔",
    founded: 1941,
    address: "宜蘭市力行路 152 號",
    coords: { lat: 24.7622, lng: 121.7595 },
    groundColor: 0xc2d5b2,
    accentColor: 0x3b8276,
    cliffColor: 0x87997b,
    tagline: "鄰近宜蘭河濱的節能標竿與特教先驅",
    description:
      "創立於 1941 年，緊鄰宜蘭河濱公園綠帶，是宜蘭縣最早推動啟智與特教資源的國小之一，近年更以再生能源與節能教育榮獲國家級節能標竿獎。",
    highlights: ["宜蘭河濱生態走廊", "國家節能標竿校園", "特教與共融先驅", "陶藝與足球社團"],
    milestones: [
      {
        year: "1941",
        title: "創立宜蘭市北國民學校",
        detail: "初創時期尚未建校舍，曾暫借孔廟舊址與雷音寺授課，在地方支持下克服風災起步。",
      },
      {
        year: "1946",
        title: "更名為力行國民學校",
        detail: "戰後更名為力行國民學校，並於 1950 年代初期陸續遷建至力行路現址。",
      },
      {
        year: "1956",
        title: "借校舍支援宜蘭國中創校",
        detail: "當時頭城中學宜蘭分校（宜蘭國中前身）草創之初借用力行國小教室上課，見證縣內教育傳承。",
      },
      {
        year: "2010s",
        title: "特教深耕與國家節能標竿",
        detail: "長期擔任縣內特教重點學校，並以太陽能與綠能實作獲頒經濟部國家節能標竿肯定。",
      },
    ],
    landmarkType: "solar",
    quiz: {
      question: "力行國小除了緊鄰宜蘭河濱公園外，還曾獲得哪一項國家級肯定？",
      options: ["國家級節能標竿獎", "全國天文台首獎", "漁業養殖示範獎"],
      answerIndex: 0,
      explanation: "力行國小長期深耕能源與環境教育，推動校園節電與再生能源實作，獲頒國家級節能標竿獎肯定。",
    },
  },
  {
    id: "yilan-jh",
    name: "宜蘭縣立宜蘭國民中學",
    shortName: "宜蘭國中",
    level: "junior",
    district: "北津河畔",
    founded: 1956,
    address: "宜蘭市樹人路 37 號",
    coords: { lat: 24.7619, lng: 121.7584 },
    groundColor: 0xc8d2d8,
    accentColor: 0x2f6b82,
    cliffColor: 0x7b8c98,
    tagline: "深耕近七十載、擁有全縣首座職探夢工廠",
    description:
      "創立於 1956 年，鄰近宜蘭河畔與力行國小，除設有歷史悠久的美術資優班與特教班外，更建置宜蘭縣首座「職業試探與體驗示範中心」，帶領學子從實作探索未來。",
    highlights: ["全縣首座職探夢工廠", "美術資優教育搖籃", "創校近七十載校史", "實作與技職探索"],
    milestones: [
      {
        year: "1956",
        title: "頭城中學宜蘭分校創立",
        detail: "最初借用力行國小與宜蘭高商補校教室上課，開啟宜蘭市縣立中學教育新頁。",
      },
      {
        year: "1958",
        title: "遷入樹人路現址",
        detail: "新校舍逐步完工遷入現址，隨後於 1963 年奉准獨立為「宜蘭縣立宜蘭初級中學」。",
      },
      {
        year: "1968",
        title: "改制宜蘭國民中學",
        detail: "配合九年國民義務教育改制為宜蘭國中，同時分設出復興國中與中華國中兩所新校。",
      },
      {
        year: "近年",
        title: "成立職探夢工廠與自造中心",
        detail: "建置宜蘭縣首座職業試探與體驗示範中心，結合美術資優班打造多元實作舞台。",
      },
    ],
    landmarkType: "gears",
    quiz: {
      question: "宜蘭國中校內設有全宜蘭縣第一座哪種體驗學習中心？",
      options: ["職業試探與體驗示範中心", "海洋潛水訓練中心", "太空氣象觀測站"],
      answerIndex: 0,
      explanation: "宜蘭國中打造「職探夢工廠」職業試探中心，讓國中小學生能透過動手實作認識多元產業與職業。",
    },
  },
  {
    id: "guangfu-es",
    name: "宜蘭縣立光復國民小學",
    shortName: "光復國小",
    level: "elementary",
    district: "舊城核心",
    founded: 1899,
    address: "宜蘭市泰山路 60 號",
    coords: { lat: 24.7545, lng: 121.7471 },
    groundColor: 0xb9d6c8,
    accentColor: 0x2c7a7b,
    cliffColor: 0x7e9b8e,
    tagline: "九芎漾月護城河貫穿的無圍牆水岸學堂",
    description:
      "創立於 1899 年，前身為宜蘭小學校，結合「宜蘭河維管束計畫」打造「九芎漾月」生態護城河，將水圳、垂柳與無圍牆綠意引入校園，民族樂團表現亦屢獲全國肯定。",
    highlights: ["九芎漾月生態護城河", "無圍牆水岸校園", "1899 年百年歷史", "民族樂團常勝軍"],
    milestones: [
      {
        year: "1899",
        title: "創立宜蘭小學校",
        detail: "全臺早期少數尋常高等小學校之一，見證宜蘭近代基礎教育的開端。",
      },
      {
        year: "1946",
        title: "更名為光復國民學校",
        detail: "戰後以「光復」為名改制重編，並於 1954 年正式遷入泰山路現址校舍。",
      },
      {
        year: "1990",
        title: "成立光復民族樂團",
        detail: "深耕傳統音樂教育，國樂與絲竹合奏在全國音樂比賽中屢創特優佳績。",
      },
      {
        year: "2019",
        title: "120 週年校慶暨九芎漾月水岸",
        detail: "結合舊城護城河歷史水脈打開圍牆，打造無邊界的生態水岸學習環境。",
      },
    ],
    landmarkType: "moat",
    quiz: {
      question: "光復國小將舊城歷史水脈融入校園，打造出哪一個著名景觀？",
      options: ["九芎漾月生態護城河", "空中雲霄飛車", "地下溫泉澡堂"],
      answerIndex: 0,
      explanation: "光復國小透過維管束計畫打開圍牆，讓「九芎漾月」護城河水流與水生植物成為最自然的校園風景。",
    },
  },
  {
    id: "nanping-es",
    name: "宜蘭縣立南屏國民小學",
    shortName: "南屏國小",
    level: "elementary",
    district: "舊城核心",
    founded: 1950,
    address: "宜蘭市泰山路 98 號",
    coords: { lat: 24.7542, lng: 121.7422 },
    groundColor: 0xc4d4b0,
    accentColor: 0x4b8b5b,
    cliffColor: 0x7d916f,
    tagline: "綠建築貢獻獎合院綠洲與生命教育基地",
    description:
      "前身為空軍子弟學校，由黃建興建築師以無圍牆、合院及通風長廊重新設計，榮獲第一屆綠建築貢獻獎；長期推動校園犬生命教育並設有音樂班。",
    highlights: ["第一屆綠建築貢獻獎", "無圍牆合院通風長廊", "校園犬生命教育", "藝術才能音樂班"],
    milestones: [
      {
        year: "1950",
        title: "設立空軍總部附設宜蘭小學",
        detail: "原位於宜蘭北機場一帶，為安置空軍子弟而設，是宜蘭早期少見的非縣立小學。",
      },
      {
        year: "1966",
        title: "更名紀念李南屏烈士",
        detail: "移交宜蘭縣政府接管，為紀念執行任務殉職的李南屏烈士而定名南屏國小。",
      },
      {
        year: "1994",
        title: "遷建泰山路新校園",
        detail: "由黃建興建築師規劃合院式開放綠建築，開啟臺灣新校園運動的生態建築典範。",
      },
      {
        year: "近年",
        title: "綠建築貢獻獎與生命教育",
        detail: "榮獲第一屆綠建築貢獻獎肯定，並以校園犬伴學與飛行探索課程聞名。",
      },
    ],
    landmarkType: "courtyard",
    quiz: {
      question: "南屏國小在建築與教育上兼具「綠建築貢獻獎」與哪一項溫暖特色？",
      options: ["校園犬生命教育與音樂班", "火箭發射課程", "海洋漁船駕駛"],
      answerIndex: 0,
      explanation: "南屏國小不僅是建築師黃建興打造的綠建築綠洲，也長期照顧校園犬並推動深具溫度的生命教育。",
    },
  },
  {
    id: "yilan-es",
    name: "宜蘭縣立宜蘭國民小學",
    shortName: "宜蘭國小",
    level: "elementary",
    district: "舊城核心",
    founded: 1918,
    address: "宜蘭市崇聖街 2 號",
    coords: { lat: 24.7531, lng: 121.7536 },
    groundColor: 0xdfd3be,
    accentColor: 0xb85d3b,
    cliffColor: 0x998975,
    tagline: "百年女子公學校源流與縣定科學教育中心",
    description:
      "前身為 1918 年創立的「宜蘭女子公學校」，見證宜蘭近代女性教育起源。校內戰後現代風格的「科學教育中心」已登錄為縣定歷史建築，桌球與弦樂表現出色。",
    highlights: ["縣定歷史建築科學教育中心", "百年女校歷史源流", "桌球與弦樂重點培育", "舊城崇聖街文教圈"],
    milestones: [
      {
        year: "1918",
        title: "自宜蘭公學校分設女子公學校",
        detail: "創立「宜蘭女子公學校」，成為蘭陽地區近代女子初等教育的重要搖籃。",
      },
      {
        year: "1941",
        title: "更名向陽／女子國民學校",
        detail: "日治末期改稱向陽國民學校，戰後 1946 年定名為宜蘭市女子國民學校。",
      },
      {
        year: "1996",
        title: "轉型男女兼收並更名宜蘭國小",
        detail: "配合學區共融政策全面改為男女合校，並正式更名為「宜蘭國民小學」。",
      },
      {
        year: "2019",
        title: "科學教育中心登錄歷史建築",
        detail: "歡慶創校百年後，校內建於 1984 年的科學教育中心以其獨特現代建築語彙獲登錄縣定歷史建築。",
      },
    ],
    landmarkType: "science",
    quiz: {
      question: "宜蘭國小校內哪一棟獨特的戰後建築被登錄為宜蘭縣歷史建築？",
      options: ["科學教育中心", "天文旋轉塔", "紅磚穀倉"],
      answerIndex: 0,
      explanation: "宜蘭國小「科學教育中心」保留具代表性的戰後現代主義建築語彙，是舊城區珍貴的教育文化資產。",
    },
  },
  {
    id: "zhongshan-es",
    name: "宜蘭縣立中山國民小學",
    shortName: "中山國小",
    level: "elementary",
    district: "舊城核心",
    founded: 1896,
    address: "宜蘭市崇聖街 4 號",
    coords: { lat: 24.7541, lng: 121.7549 },
    groundColor: 0xe6cdb9,
    accentColor: 0xc9533c,
    cliffColor: 0xa1806f,
    tagline: "1896 年創校的蘭陽首學與溜滑梯樂園",
    description:
      "前身為 1896 年宜蘭國語傳習所，培育蔣渭水、楊英風等傑出校友。校內擁有多座造型豐富的特色溜滑梯（日月星、海盜船與大碗公），是孩子最愛的遊戲學習天堂。",
    highlights: ["1896 年蘭陽首學底蘊", "日月星與海盜船溜滑梯", "蔣渭水與楊英風母校", "緊鄰中山公園綠地"],
    milestones: [
      {
        year: "1896",
        title: "設立宜蘭國語傳習所",
        detail: "宜蘭第一所現代化新式教育學校，1898 年改設為宜蘭公學校，有「蘭陽首學」之譽。",
      },
      {
        year: "1941",
        title: "改稱旭國民學校",
        detail: "依循當時學制改名，校友涵蓋台灣民主運動先驅蔣渭水與知名雕塑家楊英風。",
      },
      {
        year: "1968",
        title: "正式定名為中山國小",
        detail: "配合九年國民義務教育改制為「宜蘭縣宜蘭市中山國民小學」。",
      },
      {
        year: "1996",
        title: "百年校慶與男女兼收",
        detail: "跨越三個世紀迎向百年，解除純男校傳統全面男女兼收，並陸續打造特色溜滑梯樂園。",
      },
    ],
    landmarkType: "slides",
    quiz: {
      question: "創立於 1896 年的中山國小，校內最受親子歡迎的設施特色是什麼？",
      options: ["多座造型獨特的溜滑梯樂園", "校內火車鐵軌", "屋頂摩天輪"],
      answerIndex: 0,
      explanation: "中山國小將遊戲場融入校園空間，擁有日月星、海盜船、大碗公等多座造型溜滑梯，被暱稱為「溜滑梯小學」。",
    },
  },
  {
    id: "liming-es",
    name: "宜蘭縣立黎明國民小學",
    shortName: "黎明國小",
    level: "elementary",
    district: "東區文教",
    founded: 1918,
    address: "宜蘭市校舍路 1 號",
    coords: { lat: 24.752, lng: 121.7643 },
    groundColor: 0xc5d8dc,
    accentColor: 0x2b7cb3,
    cliffColor: 0x7c97a3,
    tagline: "東門最大學府、擁有溫控暖水游泳池",
    description:
      "源自 1918 年美福分校，現為宜蘭市學生人數規模最大的小學之一，校內建有少見的室內溫控暖水游泳池，全年推動水域安全教學，並以醒獅戰鼓、籃球與國樂團聞名。",
    highlights: ["市區規模最大國小", "室內溫控暖水泳池", "醒獅戰鼓與國樂團", "百年東區文教重鎮"],
    milestones: [
      {
        year: "1918",
        title: "宜蘭公學校美福分校成立",
        detail: "創設於 1918 年，1921 年獨立為壯二公學校，後於 1929 年改稱壯四公學校。",
      },
      {
        year: "1944",
        title: "遷入校舍路現址",
        detail: "因區域劃歸宜蘭市而更名為東國民學校，1944 年正式遷至東村里校舍路新址。",
      },
      {
        year: "1968",
        title: "改制黎明國民小學",
        detail: "戰後命名為黎明國民學校，隨九年國教改制後伴隨東區繁榮快速成長為大學校。",
      },
      {
        year: "2021",
        title: "百年校慶與游泳多元展能",
        detail: "盛大慶祝創校百週年，並以校內溫水泳池、醒獅戰鼓與國樂團打造全人校園。",
      },
    ],
    landmarkType: "pool",
    quiz: {
      question: "黎明國小校內設有哪一項在宜蘭市小學中相當少見的體育設施？",
      options: ["室內溫控暖水游泳池", "室內滑雪場", "標準高爾夫球場"],
      answerIndex: 0,
      explanation: "黎明國小建有室內溫控暖水游泳池，讓孩子即使在宜蘭多雨微涼的冬天也能安全學習游泳。",
    },
  },
  {
    id: "zhonghua-jh",
    name: "宜蘭縣立中華國民中學",
    shortName: "中華國中",
    level: "junior",
    district: "東區文教",
    founded: 1969,
    address: "宜蘭市女中路一段 100 號",
    coords: { lat: 24.7499, lng: 121.767 },
    groundColor: 0xd6cfc7,
    accentColor: 0xd96b27,
    cliffColor: 0x8f837a,
    tagline: "JHBL 冠軍搖籃、體育與國樂雙全勁旅",
    description:
      "1969 年於東區低窪水田起步，經師生胼手胝足闢建為文教重鎮。校內籃球隊曾奪下 JHBL 國中籃球聯賽全國冠軍，桌球、田徑與國樂團亦屢創佳績。",
    highlights: ["JHBL 籃球聯賽冠軍勁旅", "桌球與田徑全國佳績", "國樂團合奏優異表現", "水田變學府的拓荒史"],
    milestones: [
      {
        year: "1969",
        title: "九年國教東區設校",
        detail: "原屬宜蘭初中第二分部，獨立設校於女中路低窪水田間，創校初期僅設 8 班。",
      },
      {
        year: "1970s",
        title: "填土拓建與規模擴充",
        detail: "歷屆師生與地方人士共同填土整地、興建校舍，奠定東區完整國中學區基礎。",
      },
      {
        year: "1990s+",
        title: "國樂與體育隊伍崛起",
        detail: "中華國中國樂團、桌球隊與田徑隊陸續在全國賽事斬獲佳績，建立文武雙全校風。",
      },
      {
        year: "近年",
        title: "JHBL 全國冠軍與明日閱讀",
        detail: "男籃隊在 JHBL 賽場表現亮眼摘冠，同時全面推動明日閱讀與資優巡迴教育。",
      },
    ],
    landmarkType: "gym",
    quiz: {
      question: "中華國中哪一支運動校隊曾勇奪全國國中聯賽（JHBL）冠軍？",
      options: ["籃球隊", "冰上曲棍球隊", "棒球潛水隊"],
      answerIndex: 0,
      explanation: "中華國中籃球隊在 JHBL 賽場表現亮眼並曾摘下全國冠軍，與國樂團並列校園雙強特色。",
    },
  },
  {
    id: "fuxing-jh",
    name: "宜蘭縣立復興國民中學",
    shortName: "復興國中",
    level: "junior",
    district: "南區縣政",
    founded: 1968,
    address: "宜蘭市復興路二段 77 號",
    coords: { lat: 24.7479, lng: 121.7464 },
    groundColor: 0xd9cedb,
    accentColor: 0x7b5296,
    cliffColor: 0x8d7e91,
    tagline: "全台首創國中少年劇團與星光實驗劇場",
    description:
      "1968 年獨立設校，位於文化中心旁，在黃春明老師與劇團協助下成立全台第一個國中專業劇團「少年劇團」，並設有星光實驗劇場與管弦樂團，亦獲臺美生態學校認證。",
    highlights: ["全台首創國中少年劇團", "星光實驗劇場空間", "管弦樂與美感教育", "臺美生態學校綠旗"],
    milestones: [
      {
        year: "1968",
        title: "奉准獨立設校",
        detail: "由宜蘭初級中學第一分部獨立為復興國中，創校首年曾暫借中山國小與蘭陽女中教室上課。",
      },
      {
        year: "1969",
        title: "復興路現址校舍啟用",
        detail: "第一棟教室完工遷入現址，訂定「公、誠、勤、毅」校訓，迅速成為蘭陽指標國中。",
      },
      {
        year: "2000",
        title: "成立全台首創國中少年劇團",
        detail: "攜手國寶級作家黃春明與黃大魚兒童劇團，創立國中專業劇團並打造星光實驗劇場。",
      },
      {
        year: "近年",
        title: "臺美生態學校綠旗認證",
        detail: "結合美感實踐與環境行動，陸續榮獲臺美生態學校綠旗與銀牌最高榮譽。",
      },
    ],
    landmarkType: "theater",
    quiz: {
      question: "復興國中與作家黃春明等藝文前輩攜手，創立了全台第一個什麼社團？",
      options: ["國中專業「少年劇團」", "高空跳傘社", "極地探險隊"],
      answerIndex: 0,
      explanation: "復興國中成立「少年劇團」並改造出星光實驗劇場，是國內將戲劇與美感教育紮根校園的重要典範。",
    },
  },
  {
    id: "yucai-es",
    name: "宜蘭縣立育才國民小學",
    shortName: "育才國小",
    level: "elementary",
    district: "南區縣政",
    founded: 1918,
    address: "宜蘭市進士路一段 32 號",
    coords: { lat: 24.7451, lng: 121.7495 },
    groundColor: 0xc2d49a,
    accentColor: 0x6c8e3e,
    cliffColor: 0x819166,
    tagline: "進士稻田環抱的百年本土教育與食農基地",
    description:
      "源自 1918 年外員山分校，1938 年遷入進士路稻田間現址，經歷戰火洗禮與戰後重建；現擔任宜蘭縣本土教育中心學校，積極推動台語、客語、食農與絲竹樂團。",
    highlights: ["宜蘭縣本土教育中心", "進士田疇百年校園", "教育部永續校園殊榮", "絲竹樂團與食農教育"],
    milestones: [
      {
        year: "1918",
        title: "創立外員山分校",
        detail: "源自員山公學校分校，1921 年獨立為員山第二公學校，奠基田園教育脈絡。",
      },
      {
        year: "1938",
        title: "遷建進士路現址",
        detail: "遷至綠野稻田環抱的進士路校地，1941 年改稱南國民學校，二戰期間曾因鄰近南機場遭空襲疏散。",
      },
      {
        year: "1946",
        title: "正名為育才國民學校",
        detail: "戰後復校更名為育才，並曾分出凱旋分校，以足球與腰鼓傳統技藝聞名全縣。",
      },
      {
        year: "2019",
        title: "百年校慶暨永續本土中心",
        detail: "繼 2004 年獲教育部永續校園後迎向創校百年，持續擔任全縣本土語言與食農教育基地。",
      },
    ],
    landmarkType: "paddy",
    quiz: {
      question: "坐落稻田之間的育才國小，目前擔任宜蘭縣哪一項領域的中心學校？",
      options: ["本土教育中心（台語與客語）", "極地冰川研究", "航太火箭工程"],
      answerIndex: 0,
      explanation: "育才國小結合進士地區的農村田園地景，同時擔任宜蘭縣本土教育中心，推廣多元母語與文化傳承。",
    },
  },
  {
    id: "kaixuan-jh",
    name: "宜蘭縣立凱旋國民中學",
    shortName: "凱旋國中",
    level: "junior",
    district: "南區縣政",
    founded: 2003,
    address: "宜蘭市縣政七街 50 巷 1 號",
    coords: { lat: 24.726, lng: 121.7575 },
    groundColor: 0xbdd4bf,
    accentColor: 0x2f7d5b,
    cliffColor: 0x6f8b75,
    tagline: "菩提葉無圍牆綠建築・中軸線直望龜山島",
    description:
      "為因應縣政中心開發於 2003 年籌備設校，由建築師黃建興打造全台首創「無校門、無圍牆」菩提葉綠建築，中軸線直望龜山島，並以畢業 29 公里步行長征聞名。",
    highlights: ["菩提葉綠建築地標", "中軸線直望龜山島", "無校門無圍牆校園", "畢業 29km 步行長征"],
    milestones: [
      {
        year: "2003",
        title: "成立凱旋國中籌備處",
        detail: "配合宜蘭縣政中心新社區開發與人口成長，正式規劃縣政特區內唯一公立國中。",
      },
      {
        year: "2006",
        title: "正式核定校名並招收新生",
        detail: "開校迎接第一屆新生，打破傳統高牆藩籬，實踐無校門、無圍牆的開放社區學園。",
      },
      {
        year: "2007",
        title: "榮獲內政部優良綠建築獎",
        detail: "黃建興建築師順應季風與龜山島軸線設計的菩提葉校舍群，獲頒國家級綠建築肯定。",
      },
      {
        year: "近年",
        title: "29 公里步行長征畢業傳統",
        detail: "建立九年級會考後步行 29 公里踏查蘭陽平原的標竿課程，培養學子堅毅與土地認同。",
      },
    ],
    landmarkType: "bodhi",
    quiz: {
      question: "凱旋國中的建築群形似一片菩提葉，它的校園中軸線特別對準了哪一座地標？",
      options: ["外海的龜山島", "台北 101", "高雄 85 大樓"],
      answerIndex: 0,
      explanation: "建築師將凱旋國中的空間軸線朝東對準太平洋上的龜山島，讓自然風道、光線與蘭陽地景融入校園日常。",
    },
  },
  {
    id: "kaixuan-es",
    name: "宜蘭縣立凱旋國民小學",
    shortName: "凱旋國小",
    level: "elementary",
    district: "南區縣政",
    founded: 1965,
    address: "宜蘭市凱旋路 130 號",
    coords: { lat: 24.7244, lng: 121.7634 },
    groundColor: 0xdecfb8,
    accentColor: 0xc97b36,
    cliffColor: 0x9b8b76,
    tagline: "縣政特區內雙語、行動學習與足球名校",
    description:
      "前身為 1953 年育才國小凱旋分校，1965 年獨立建校，2000 年遷建至宜蘭縣政特區現址；校舍開闊無圍牆，以雙語、數位行動學習與直笛足球隊聞名。",
    highlights: ["雙語與行動數位學習", "展藝館美學空間", "直笛與少年足球隊", "2026 創校一甲子"],
    milestones: [
      {
        year: "1953",
        title: "育才國小凱旋分校起步",
        detail: "最初於凱旋里福德廟設分班，逐步升格為育才國小凱旋分校，服務壯二地區學童。",
      },
      {
        year: "1965",
        title: "獨立建校為凱旋國民學校",
        detail: "於 1965 年 8 月正式奉准獨立設校，1968 年改名為凱旋國民小學。",
      },
      {
        year: "2000",
        title: "遷建宜蘭縣政特區現址",
        detail: "配合縣政中心重劃遷入凱旋路新校園，以開闊通學廊道與展藝館開啟現代化教學。",
      },
      {
        year: "2026",
        title: "創校 60 週年甲子校慶",
        detail: "迎來創校一甲子里程碑，以雙語行動學習、食農教育與足球直笛隊展現活力。",
      },
    ],
    landmarkType: "bilingual",
    quiz: {
      question: "凱旋國小位於宜蘭哪一個規劃寬廣、環境清幽的現代行政特區內？",
      options: ["宜蘭縣政特區", "蘇澳漁港碼頭", "太平山森林區"],
      answerIndex: 0,
      explanation: "凱旋國小與凱旋國中皆位於宜蘭南側的縣政特區，擁有開闊的綠帶與現代化教學空間。",
    },
  },
];

export const ISLAND_BRIDGES: BridgeSpec[] = [
  // 宜蘭河北岸與跨河橋樑（對應真實西門橋、宜蘭橋、慶和橋、東港橋）
  { from: "xinsheng-es", to: "yilan-jh", style: "river", label: "宜蘭橋通學道" },
  { from: "xinsheng-es", to: "lixing-es", style: "river", label: "慶和河濱橋" },
  { from: "xinsheng-es", to: "guangfu-es", style: "river", label: "西門跨河橋" },
  { from: "yilan-jh", to: "lixing-es", style: "greenway", label: "樹人力行道" },
  { from: "lixing-es", to: "liming-es", style: "river", label: "東港跨河廊" },
  { from: "yilan-jh", to: "yilan-es", style: "oldtown", label: "新興崇聖路" },

  // 舊城核心與東區聯絡
  { from: "nanping-es", to: "guangfu-es", style: "oldtown", label: "泰山路綠廊" },
  { from: "guangfu-es", to: "yilan-es", style: "oldtown", label: "舊城西門道" },
  { from: "yilan-es", to: "zhongshan-es", style: "oldtown", label: "崇聖百年街" },
  { from: "zhongshan-es", to: "liming-es", style: "oldtown", label: "校舍東門道" },
  { from: "liming-es", to: "zhonghua-jh", style: "oldtown", label: "女中路廊" },

  // 舊城西南文化中心與進士田園
  { from: "nanping-es", to: "fuxing-jh", style: "oldtown", label: "嵐峰復興道" },
  { from: "guangfu-es", to: "fuxing-jh", style: "oldtown", label: "復興文化道" },
  { from: "yilan-es", to: "fuxing-jh", style: "oldtown" },
  { from: "yilan-es", to: "yucai-es", style: "timber", label: "進士通學路" },
  { from: "fuxing-jh", to: "yucai-es", style: "timber", label: "南區田園道" },
  { from: "zhongshan-es", to: "zhonghua-jh", style: "oldtown" },

  // 南下縣政特區（凱旋地區）
  { from: "yucai-es", to: "kaixuan-jh", style: "greenway", label: "縣政中央大道" },
  { from: "zhonghua-jh", to: "kaixuan-es", style: "greenway", label: "運動公園綠廊" },
  { from: "kaixuan-jh", to: "kaixuan-es", style: "greenway", label: "凱旋共學廊" },
];
