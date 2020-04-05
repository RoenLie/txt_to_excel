const createExcelDataStructure = (
  fileData: any,
  outData: any,
  speedFilter: any
) => {
  // split data by new line
  const splitByNewLine: any[] = fileData.split("\n");

  // store raw data in object
  const rawData = {
    id: [splitByNewLine[0]],
    speed_prefix: splitByNewLine[1].split(";"),
    speed_fix_prefix: splitByNewLine[2].split(";"),
    speed_post_prefix: splitByNewLine[3].split(";"),
    dist_prefix: splitByNewLine[4].split(";"),
    dist_fix_prefix: splitByNewLine[5].split(";"),
    dist_post_prefix: splitByNewLine[6].split(";"),
    time_prefix: splitByNewLine[7].split(";"),
    time_fix_prefix: splitByNewLine[8].split(";"),
    time_post_prefix: splitByNewLine[9].split(";"),
    draught_prefix: splitByNewLine[10].split(";"),
    draught_fix: splitByNewLine[11].split(";"),
    draught_post: splitByNewLine[12].split(";"),
    time_stamp_prefix: splitByNewLine[13].split(";"),
    time_stamp_fix: splitByNewLine[14].split(";"),
    time_stamp_post: splitByNewLine[15].split(";"),
    dist_dest_prefix: splitByNewLine[16].split(";"),
    dist_dest_fix: splitByNewLine[17].split(";"),
    date: [splitByNewLine[18]],
    name: [splitByNewLine[19]],
    imo: [splitByNewLine[20]],
    dwt: [splitByNewLine[21]],
    loa: [splitByNewLine[22]],
    beam: [splitByNewLine[23]],
    draught_design: [splitByNewLine[24]],
    built: [splitByNewLine[25]],
    quantity: [splitByNewLine[26]],
    type: [splitByNewLine[27]],
    charterer: [splitByNewLine[28]],
    load: [splitByNewLine[29]],
    discharge: [splitByNewLine[30]],
    laycan_from: [splitByNewLine[31]],
    laycan_to: [splitByNewLine[32]],
    route: [splitByNewLine[33]],
    w_from: [splitByNewLine[34]],
    w_to: [splitByNewLine[35]],
    dist_to_dest_fix: [splitByNewLine[36]],
    r_TA_fix: [splitByNewLine[37]],
    r_FH_fix: [splitByNewLine[38]],
    r_BH_fix: [splitByNewLine[39]],
    r_TP_fix: [splitByNewLine[40]],
    r_aver_fix: [splitByNewLine[41]],
    error_occured: [splitByNewLine[42]]
  };

  // calculate hull slenderness
  const hullSlenderness = [
    rawData.dwt[0] /
      (rawData.loa[0] * rawData.beam[0] * rawData.draught_design[0])
  ];

  // remove last entry in each time period for timestamp and draught
  rawData.time_stamp_prefix.pop();
  rawData.time_stamp_fix.pop();
  rawData.time_stamp_post.pop();
  rawData.draught_prefix.pop();
  rawData.draught_fix.pop();
  rawData.draught_post.pop();

  // create column with statuses matching the time stamps
  const status = [
    ...Array(rawData.time_stamp_prefix.length).fill("prefix"),
    ...Array(rawData.time_stamp_fix.length).fill("fix"),
    ...Array(rawData.time_stamp_post.length).fill("post")
  ];

  // combine speed, dist and draught into long columns
  const combined = {
    speedColumn: [
      ...rawData.speed_prefix,
      ...rawData.speed_fix_prefix,
      ...rawData.speed_post_prefix
    ],

    distColumn: [
      ...rawData.dist_prefix,
      ...rawData.dist_fix_prefix,
      ...rawData.dist_post_prefix
    ],

    timeColumn: [
      ...rawData.time_prefix,
      ...rawData.time_fix_prefix,
      ...rawData.time_post_prefix
    ],

    draughtColumn: [
      ...rawData.draught_prefix,
      ...rawData.draught_fix,
      ...rawData.draught_post
    ],

    timeStampColumn: [
      ...rawData.time_stamp_prefix,
      ...rawData.time_stamp_fix,
      ...rawData.time_stamp_post
    ],

    distanceColumn: [...rawData.dist_dest_prefix, ...rawData.dist_dest_fix]
  };

  // fill out distance column so it matches length of speed column
  while (combined.distanceColumn.length < combined.speedColumn.length) {
    combined.distanceColumn.push("0");
  }

  // array and temp object to store average calculations
  const averages = [];
  const temp = {
    speed: [] as any,
    dist: [] as any,
    time: [] as any,
    draught: "" as string,
    remainingDistance: "",
    status: "",
    date: ""
  };

  // calculate averages per day for speed, distance, time and draught
  for (let i = 0; i < combined.timeStampColumn.length; i++) {
    const date = combined.timeStampColumn[i].split(" ")[0];
    if (temp.date == "") temp.date = date;

    if (date !== temp.date) {
      const reducer = (accumulator: number, currentValue: number) =>
        accumulator + currentValue;

      if (temp.speed.length > 0) {
        let speed = temp.speed.reduce(reducer) / temp.speed.length;
        let dist = temp.dist.reduce(reducer) / temp.dist.length;
        let time = temp.time.reduce(reducer) / temp.time.length;
        let draught = temp.draught;
        let remainingDistance = temp.remainingDistance;
        let status = temp.status;

        averages.push([
          speed,
          dist,
          time,
          draught,
          temp.date,
          remainingDistance,
          status
        ]);
      }

      temp.speed = [];
      temp.dist = [];
      temp.time = [];
      temp.draught = "";
      temp.remainingDistance = "";
      temp.status = "";
      temp.date = "";
    }

    if (Number(combined.speedColumn[i]) >= speedFilter.value) {
      temp.speed.push(Number(combined.speedColumn[i]));
      temp.dist.push(Number(combined.distColumn[i]));
      temp.time.push(Number(combined.timeColumn[i]));
      temp.draught = combined.draughtColumn[i];
      temp.remainingDistance = combined.distanceColumn[i];
      temp.status = status[i];
    }
  }

  // create new arrays containing averages
  const modifiedData = {
    newSpeedColumn: averages.map(item => item[0]),
    newDistColumn: averages.map(item => item[1]),
    newTimeColumn: averages.map(item => item[2]),
    newDraughtColumn: averages.map(item => item[3]),
    newDateColumn: averages.map(item => item[4]),
    newRemainingDistanceColumn: averages.map(item => item[5]),
    newStatusColumn: averages.map(item => item[6])
  };

  // list of column names to be added after data parsing
  const columnNames = [
    "placeholder1",
    "placeholder2",
    "placeholder3",
    "placeholder4",
    "time_stamp",
    "id",
    "speed",
    "dist",
    "time",
    "draught bound",
    "remaining distance",
    "status",
    "date",
    "name",
    "imo",
    "Hull Slenderness",
    "dwt",
    "loa",
    "beam",
    "draught_design",
    "built",
    "quantity",
    "type",
    "charterer",
    "load",
    "discharge",
    "laycan_from",
    "laycan_to",
    "route",
    "w_from",
    "w_to",
    "dist_to_dest_fix",
    "r_TA_fix",
    "r_FH_fix",
    "r_BH_fix",
    "r_TP_fix",
    "r_aver_fix",
    "error_occured"
  ];

  // Create matrix sizer
  const matrixSizer = [...Array(modifiedData.newSpeedColumn.length).fill([])];

  // data matrix
  const matrix: any[] = [
    [...matrixSizer],
    [...matrixSizer],
    [...matrixSizer],
    [...matrixSizer],
    modifiedData.newDateColumn,
    rawData.id,
    modifiedData.newSpeedColumn,
    modifiedData.newDistColumn,
    modifiedData.newTimeColumn,
    modifiedData.newDraughtColumn,
    modifiedData.newRemainingDistanceColumn,
    modifiedData.newStatusColumn,
    rawData.date,
    rawData.name,
    rawData.imo,
    hullSlenderness,
    rawData.dwt,
    rawData.loa,
    rawData.beam,
    rawData.draught_design,
    rawData.built,
    rawData.quantity,
    rawData.type,
    rawData.charterer,
    rawData.load,
    rawData.discharge,
    rawData.laycan_from,
    rawData.laycan_to,
    rawData.route,
    rawData.w_from,
    rawData.w_to,
    rawData.dist_to_dest_fix,
    rawData.r_TA_fix,
    rawData.r_FH_fix,
    rawData.r_BH_fix,
    rawData.r_TP_fix,
    rawData.r_aver_fix,
    rawData.error_occured
  ];

  // fill out rows on columns with less than matrix
  matrix.forEach(item => {
    while (item.length < matrixSizer.length) {
      item.push(item[0]);
    }
  });

  // Insert column names if this is the first document
  if (outData.length === 0) {
    matrix.forEach((value, index, array) => {
      array[index].unshift(columnNames[index]);
    });
  }
  // returns data matrix, ready to be transposed
  return matrix;
};

export default createExcelDataStructure;
