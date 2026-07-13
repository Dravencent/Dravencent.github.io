function bilingual(en, zh) {
  return { en, zh };
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

export const APPROVED_ACADEMIC_DATA = deepFreeze({
  profile: {
    name: bilingual("Yu Zhan", "湛煜"),
    headline: bilingual(
      "Intelligent Design of Lithium-Battery Electrolytes",
      "锂电池电解液的智能设计",
    ),
    role: bilingual(
      "Ph.D. Student in Materials Science and Engineering",
      "材料科学与工程专业博士研究生",
    ),
    institution: bilingual("Beijing Institute of Technology", "北京理工大学"),
    biography: bilingual(
      "Yu Zhan is a Ph.D. student in Materials Science and Engineering at Beijing Institute of Technology and a member of the Advanced Energy Materials and Intelligent Battery Innovation Team under the supervision of Associate Professor Nan Chen. His research focuses on the intelligent design of lithium-battery electrolytes by integrating machine learning, computational methods, and electrochemical analysis, with particular interests in high-voltage stability, novel lithium salts, interfacial chemistry, and ion transport.",
      "湛煜现为北京理工大学材料科学与工程专业博士研究生，是先进能源材料及智能电池创新团队成员，在陈楠副教授指导下开展研究。他的研究聚焦锂电池电解液的智能设计，结合机器学习、计算方法与电化学分析，重点关注高电压稳定性、新型锂盐、电解液界面化学和离子输运。",
    ),
    contact: { email: "3120245693@bit.edu.cn" },
    links: {
      github: "https://github.com/Dravencent",
      orcid: "https://orcid.org/0009-0007-9163-9385",
    },
    supervisor: {
      name: bilingual("Associate Professor Nan Chen", "陈楠副教授"),
      url: "https://mse.bit.edu.cn/szdw/jgml/nyyhjclxg/821e424420484a409c4721ca7512e8ad.htm",
    },
    team: {
      name: bilingual(
        "Advanced Energy Materials and Intelligent Battery Innovation Team",
        "先进能源材料及智能电池创新团队",
      ),
      url: "https://bit-battery.com.cn/index.php",
    },
    education: [
      {
        id: "bit-phd-materials",
        degree: bilingual(
          "Ph.D. in Materials Science and Engineering",
          "材料科学与工程博士",
        ),
        institution: bilingual("Beijing Institute of Technology", "北京理工大学"),
        start_date: "2024-09",
        end_date: "present",
      },
      {
        id: "bit-ms-materials",
        degree: bilingual(
          "M.S. in Materials Science and Engineering",
          "材料科学与工程硕士",
        ),
        institution: bilingual("Beijing Institute of Technology", "北京理工大学"),
        start_date: "2021-09",
        end_date: "2024-06",
      },
      {
        id: "bit-beng-polymer-materials",
        degree: bilingual(
          "B.Eng. in Polymer Materials and Engineering",
          "高分子材料与工程学士",
        ),
        institution: bilingual("Beijing Institute of Technology", "北京理工大学"),
        start_date: "2017-09",
        end_date: "2021-06",
      },
    ],
    skills: ["Python", "Gaussian", "ORCA", "CP2K", "GROMACS"],
    research_directions: [
      {
        id: "data-driven-electrolyte-screening",
        title: bilingual("Data-Driven Electrolyte Screening", "数据驱动的电解液筛选"),
        description: bilingual(
          "Machine learning, molecular descriptors, and candidate-system screening.",
          "利用机器学习、分子描述符和数据驱动方法开展候选电解液体系的筛选与优先级排序。",
        ),
        status: bilingual("active", "博士阶段研究方向"),
        related_publication_ids: [
          "zhan-2026-ai-high-voltage-electrolytes",
          "zhai-2026-coulometric-screening",
        ],
      },
      {
        id: "novel-lithium-salt-design",
        title: bilingual("Novel Lithium Salt Design", "新型锂盐设计"),
        description: bilingual(
          "An ongoing doctoral research direction involving molecular design and computational evaluation of novel lithium salts, with attention to solvation behavior, electrochemical stability, and interfacial compatibility. No unpublished performance result is stated.",
          "面向锂电池电解液开展新型锂盐的分子设计与计算评估，关注其溶剂化行为、电化学稳定性及界面相容性；在成果公开前不陈述未经发表的性能结论。",
        ),
        status: bilingual("ongoing", "持续开展"),
        related_publication_ids: [],
      },
      {
        id: "electrolyte-interfaces-and-stability",
        title: bilingual("Electrolyte Interfaces and Stability", "电解液界面与稳定性"),
        description: bilingual(
          "High-voltage stability, SEI chemistry, solid and polymer electrolyte interfaces, and ion transport.",
          "研究高电压条件下的电解液稳定性、SEI化学、固态与聚合物电解质界面以及离子输运行为。",
        ),
        status: bilingual("active", "博士阶段研究方向"),
        related_publication_ids: [
          "zhan-2024-dual-layer-sei",
          "yang-2026-interphase-activators",
          "zhai-2026-coulometric-screening",
          "long-2026-deep-eutectic-interlayer",
          "ge-2021-green-polymer-electrolyte",
          "liu-2020-waterborne-polyurethane",
        ],
      },
    ],
  },
  publications: [
    {
      id: "zhan-2026-ai-high-voltage-electrolytes",
      title: "AI for battery-accelerated discovery of high-voltage electrolytes for advanced lithium batteries",
      authors: ["Yu Zhan", "Nan Chen", "Li Li", "Feng Wu", "Renjie Chen"],
      journal: "Chemical Society Reviews",
      year: 2026,
      doi: "10.1039/D4CS01250J",
      selected: true,
      first_author: true,
    },
    {
      id: "zhan-2024-dual-layer-sei",
      title: "Enhanced performance in lithium metal batteries: A dual-layer solid electrolyte interphase strategy via perfluoropolyether derivative additive",
      authors: ["Yu Zhan", "Pengfei Zhai", "Tinglu Song", "Wen Yang", "Yuchuan Li"],
      journal: "Chemical Engineering Journal",
      year: 2024,
      volume: "491",
      article_number: "151974",
      doi: "10.1016/j.cej.2024.151974",
      selected: true,
      first_author: true,
    },
    {
      id: "yang-2026-interphase-activators",
      title: "Interphase activators for continuous Li+ transport in garnet-polymer composite solid electrolytes at room temperature",
      authors: [
        "Binbin Yang", "Nan Chen", "Yu Zhan", "Jun Wei", "Liyuan Zhao", "Ningning Wu",
        "Yusheng Ye", "Dingguo Xia", "Feng Wu", "Renjie Chen",
      ],
      journal: "Science Bulletin",
      year: 2026,
      doi: "10.1016/j.scib.2026.06.039",
      selected: true,
      first_author: false,
    },
    {
      id: "zhai-2026-coulometric-screening",
      title: "Screening additive for stable solid electrolyte interphase in polymer lithium battery by coulometric titration time analysis",
      authors: ["Pengfei Zhai", "Yu Zhan", "Zidan Cao", "Heng Mao"],
      journal: "Journal of Colloid and Interface Science",
      year: 2026,
      volume: "716",
      article_number: "140359",
      doi: "10.1016/j.jcis.2026.140359",
      selected: true,
      first_author: false,
    },
    {
      id: "long-2026-deep-eutectic-interlayer",
      title: "Deep Eutectic Interlayer Design for Stability Enhancement in LLZTO Solid-State Lithium Batteries",
      authors: [
        "Sihong Long", "Boshun Gui", "Chengjie Li", "Binbin Yang", "Lipu Sun", "Yu Zhan",
        "Chuhuai Huang", "Jianing Tian", "Feng Wu", "Nan Chen", "Renjie Chen",
      ],
      journal: "Advanced Functional Materials",
      year: 2026,
      volume: "36",
      issue: "8",
      article_number: "e13024",
      doi: "10.1002/adfm.202513024",
      selected: false,
      first_author: false,
    },
    {
      id: "chen-2025-nicotinamide-zinc-air",
      title: "Nicotinamide Solid Cosolvent Enhanced Two-Electron Zinc Peroxide Chemistry for Stable Neutral Zinc-Air Batteries",
      authors: [
        "Nuo Chen", "Jingning Lai", "Fengling Zhang", "Wen Sun", "Bohua Li", "Lipu Sun",
        "Yu Zhan", "Jixiang Wang", "Nan Chen", "Li Li", "Feng Wu", "Renjie Chen",
      ],
      journal: "Nano Letters",
      year: 2025,
      volume: "25",
      issue: "27",
      pages: "10770-10777",
      doi: "10.1021/acs.nanolett.5c01562",
      selected: false,
      first_author: false,
    },
    {
      id: "ge-2021-green-polymer-electrolyte",
      title: "Preparation and properties of a novel green solid polymer electrolyte for all-solid-state lithium battery",
      authors: ["Zhen Ge", "Xiaoli Liu", "Xiaobin Zou", "Yu Zhan", "Yunjun Luo"],
      journal: "Journal of Applied Polymer Science",
      year: 2021,
      volume: "138",
      issue: "37",
      article_number: "50945",
      doi: "10.1002/app.50945",
      selected: false,
      first_author: false,
    },
    {
      id: "liu-2020-waterborne-polyurethane",
      title: "A novel polymer electrolyte matrix incorporating ionic liquid into waterborne polyurethane for lithium-ion battery",
      authors: ["Xiaoli Liu", "Yu Zhan", "Chenying Zhao", "Yuefeng Su", "Zhen Ge", "Yunjun Luo"],
      journal: "Polymers",
      year: 2020,
      volume: "12",
      issue: "7",
      article_number: "1513",
      doi: "10.3390/polym12071513",
      selected: false,
      first_author: false,
    },
  ],
  awards: [
    {
      id: "bit-student-honoree-2026",
      date: "2026-04",
      year: 2026,
      official_title_zh: "北京理工大学第十五届“青年盛典”暨2026年学生表彰大会",
      award_level: bilingual("University Honor", "校级荣誉"),
      role: bilingual("Student Honoree", "获表彰学生"),
      english_descriptor: "University student honoree; April 2026.",
    },
    {
      id: "zero-carbon-future-second-prize-2025",
      date: "2025-11",
      year: 2025,
      official_title_zh: "第五届零碳未来创新大赛二等奖",
      award_level: bilingual("Second Prize", "二等奖"),
      role: bilingual("Team Member", "团队成员"),
      english_descriptor: "Second Prize; Team Member; November 2025.",
    },
    {
      id: "beijing-student-innovation-third-2025",
      date: "2025-09",
      year: 2025,
      official_title_zh: "第四届北京大学生创新创业大赛科技创新赛道三等奖",
      award_level: bilingual("Third Prize", "三等奖"),
      role: bilingual("Team Member", "团队成员"),
      english_descriptor: "Third Prize, Science and Technology Innovation Track; Team Member; September 2025.",
    },
    {
      id: "energy-equipment-design-third-2025",
      date: "2025-09",
      year: 2025,
      official_title_zh: "第十二届中国研究生能源装备创新设计大赛三等奖",
      award_level: bilingual("Third Prize", "三等奖"),
      role: bilingual("Team Member", "团队成员"),
      english_descriptor: "Third Prize; Team Member; September 2025.",
      project_title: "冷能引擎--为“锂”定制的极寒电解液",
    },
    {
      id: "national-ai-innovation-grand-2025",
      date: "2025-06",
      year: 2025,
      official_title_zh: "首届全国人工智能应用创新大赛通用赛道全国赛研究生组特等奖",
      award_level: bilingual("Grand Prize", "特等奖"),
      role: bilingual("Co-recipient", "共同获奖人"),
      english_descriptor: "National Finals Grand Prize, Graduate Division; Co-recipient; June 2025.",
      project_title: "自选主题的大模型Agent创新应用设计",
    },
    {
      id: "china-international-innovation-2024",
      date: "2024-09",
      year: 2024,
      official_title_zh: "中国国际大学生创新大赛（2024）北京赛区二等奖",
      award_level: bilingual("Second Prize", "二等奖"),
      role: bilingual("Team Member", "团队成员"),
      english_descriptor: "Beijing Regional Second Prize; Team Member; September 2024.",
      project_title: "高比能、宽温域的固态电池在新能源汽车领域的研发与应用",
    },
  ],
});

export function approvedAcademicData() {
  return structuredClone(APPROVED_ACADEMIC_DATA);
}
