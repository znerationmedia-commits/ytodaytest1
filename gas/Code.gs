// ─── CONFIGURATION ────────────────────────────────────────────────────────────
// Replace with your Research Progress & OT spreadsheet ID
var RESEARCH_SPREADSHEET_ID = "1qj-OvVKl5hVEu-CX0rkPAEkL8bj33J_0I2sqDqAHqs4";
var RESEARCH_SHEET_NAME = "2025";
var DATA_START_ROW = 4; // rows 1-3 are headers
var TOTAL_COLS = 28;    // columns A through AB

// ─── ENTRY POINTS ─────────────────────────────────────────────────────────────

function doGet(e) {
  var action = e.parameter.action;
  try {
    var data;
    if (action === "getCampaigns") {
      data = getCampaigns();
    } else if (action === "getCampaign") {
      data = getCampaignByRow(parseInt(e.parameter.rowIndex));
    } else if (action === "getKolList") {
      data = getKolList(e.parameter.clientSheetId);
    } else if (action === "getSettings") {
      data = getSettings();
    } else {
      throw new Error("Unknown action: " + action);
    }
    return jsonResponse({ success: true, data: data });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    var payload = body.payload;
    var data;
    if (action === "createCampaign") {
      data = createCampaign(payload);
    } else if (action === "updateCampaign") {
      updateCampaign(payload.rowIndex, payload.data);
    } else if (action === "createClientSheet") {
      data = createClientSheet(payload.campaignName, payload.rowIndex);
    } else if (action === "addKolEntry") {
      data = addKolEntry(payload.clientSheetId, payload.data);
    } else if (action === "updateKolEntry") {
      updateKolEntry(payload.clientSheetId, payload.rowIndex, payload.data);
    } else if (action === "updateSettings") {
      updateSettings(payload);
    } else {
      throw new Error("Unknown action: " + action);
    }
    return jsonResponse({ success: true, data: data || null });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getResearchSheet() {
  var ss = SpreadsheetApp.openById(RESEARCH_SPREADSHEET_ID);
  return ss.getSheets()[0]; // "2025" tab — first tab
}

function formatDateValue(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return String(val);
}

function rowToCampaign(row, rowIndex) {
  return {
    rowIndex: rowIndex,
    pic: String(row[0] || ""),
    picSupport: String(row[1] || ""),
    urgent: String(row[2] || ""),
    revenueSize: String(row[3] || ""),
    dateRequest: formatDateValue(row[4]),
    bdName: String(row[5] || ""),
    agencyName: String(row[6] || ""),
    campaignName: String(row[7] || ""),
    stage: String(row[8] || ""),
    clientWebsite: String(row[9] || ""),
    platformDetails: String(row[10] || ""),
    kolRequirement: String(row[11] || ""),
    budget: String(row[12] || ""),
    timeline: String(row[13] || ""),
    category: String(row[14] || ""),
    clientSheetLink: String(row[15] || ""),
    ytUniqueLink: String(row[16] || ""),
    ytAdminLink: String(row[17] || ""),
    internalSheet: String(row[18] || ""),
    copywriting: String(row[19] || ""),
    zynnApproval: String(row[20] || ""),
    telegramPosted: String(row[21] || ""),
    emailBlasted: String(row[22] || ""),
    fbGroupPosted: String(row[23] || ""),
    ytAdminContact: String(row[24] || ""),
    googleResearch: String(row[25] || ""),
    heepsyContact: String(row[26] || "")
  };
}

// ─── CAMPAIGN FUNCTIONS ────────────────────────────────────────────────────────

function getCampaigns() {
  var sheet = getResearchSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < DATA_START_ROW) return [];
  var numRows = lastRow - DATA_START_ROW + 1;
  var data = sheet.getRange(DATA_START_ROW, 1, numRows, TOTAL_COLS).getValues();
  var campaigns = [];
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var campaignName = String(row[7] || "").trim();
    // Skip blank rows and red divider rows
    if (!campaignName) continue;
    campaigns.push(rowToCampaign(row, DATA_START_ROW + i));
  }
  return campaigns;
}

function getCampaignByRow(rowIndex) {
  var sheet = getResearchSheet();
  var row = sheet.getRange(rowIndex, 1, 1, TOTAL_COLS).getValues()[0];
  return rowToCampaign(row, rowIndex);
}

function createCampaign(data) {
  var sheet = getResearchSheet();
  var newRow = [
    data.pic || "",
    data.picSupport || "",
    data.urgent || "",
    data.revenueSize || "",
    data.dateRequest || "",
    data.bdName || "",
    data.agencyName || "",
    data.campaignName || "",
    data.stage || "",
    data.clientWebsite || "",
    data.platformDetails || "",
    data.kolRequirement || "",
    data.budget || "",
    data.timeline || "",
    data.category || "",
    "",                        // col 16 (P) = clientSheetLink, auto-filled by createClientSheet
    data.ytUniqueLink || "",
    data.ytAdminLink || "",
    data.internalSheet || "",
    data.copywriting || "",
    data.zynnApproval || "",
    data.telegramPosted || "",
    data.emailBlasted || "",
    data.fbGroupPosted || "",
    data.ytAdminContact || "",
    data.googleResearch || "",
    data.heepsyContact || "",
    ""                         // col 28 (AB) unused
  ];
  sheet.appendRow(newRow);
  return { rowIndex: sheet.getLastRow() };
}

function updateCampaign(rowIndex, data) {
  var sheet = getResearchSheet();
  var colMap = {
    pic: 1, picSupport: 2, urgent: 3, revenueSize: 4, dateRequest: 5,
    bdName: 6, agencyName: 7, campaignName: 8, stage: 9, clientWebsite: 10,
    platformDetails: 11, kolRequirement: 12, budget: 13, timeline: 14, category: 15,
    clientSheetLink: 16, ytUniqueLink: 17, ytAdminLink: 18,
    internalSheet: 19, copywriting: 20, zynnApproval: 21, telegramPosted: 22,
    emailBlasted: 23, fbGroupPosted: 24, ytAdminContact: 25, googleResearch: 26,
    heepsyContact: 27
  };
  for (var key in data) {
    if (colMap[key]) {
      sheet.getRange(rowIndex, colMap[key]).setValue(data[key]);
    }
  }
}

// ─── CLIENT SHEET FUNCTIONS ────────────────────────────────────────────────────

function createClientSheet(campaignName, campaignRowIndex) {
  var title = "[CLIENT] - " + campaignName;
  var newSS = SpreadsheetApp.create(title);
  var sheet = newSS.getActiveSheet();
  sheet.setName(title);

  // Set headers
  var headers = ["NO.", "NAME", "PROFILE LINK (TT)", "FOLLOWERS",
                 "INTEREST CHECK (CLIENT)", "INTEREST CHECK (KOLs)",
                 "YT Remarks", "Client Remarks"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Style header row - orange background matching the template
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#f4a261");
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");

  // Freeze header row
  sheet.setFrozenRows(1);

  // Set column widths
  sheet.setColumnWidth(1, 50);   // NO.
  sheet.setColumnWidth(2, 180);  // NAME
  sheet.setColumnWidth(3, 250);  // PROFILE LINK
  sheet.setColumnWidth(4, 100);  // FOLLOWERS
  sheet.setColumnWidth(5, 160);  // INTEREST CHECK (CLIENT)
  sheet.setColumnWidth(6, 160);  // INTEREST CHECK (KOLs)
  sheet.setColumnWidth(7, 200);  // YT Remarks
  sheet.setColumnWidth(8, 200);  // Client Remarks

  // Add dropdown validation for Interest Check columns (E and F)
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["YES", "NO"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 5, 100, 1).setDataValidation(rule);
  sheet.getRange(2, 6, 100, 1).setDataValidation(rule);

  // Share so anyone with the link can view (client access)
  var file = DriveApp.getFileById(newSS.getId());
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  var url = newSS.getUrl();

  // Write URL back to column P (16) of the campaign row in Research sheet
  var researchSheet = getResearchSheet();
  researchSheet.getRange(campaignRowIndex, 16).setValue(url);

  return { url: url };
}

function getKolList(clientSheetId) {
  var ss = SpreadsheetApp.openById(clientSheetId);
  var sheet = ss.getSheets()[0];
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  var data = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
  var results = [];
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if (!String(row[1] || "").trim()) continue; // skip blank name rows
    results.push({
      rowIndex: i + 2,
      no: String(row[0] || ""),
      name: String(row[1] || ""),
      profileLink: String(row[2] || ""),
      followers: String(row[3] || ""),
      interestCheckClient: String(row[4] || ""),
      interestCheckKol: String(row[5] || ""),
      ytRemarks: String(row[6] || ""),
      clientRemarks: String(row[7] || "")
    });
  }
  return results;
}

function addKolEntry(clientSheetId, data) {
  var ss = SpreadsheetApp.openById(clientSheetId);
  var sheet = ss.getSheets()[0];
  var lastRow = sheet.getLastRow();
  var nextNo = lastRow; // header is row 1, so nextNo = lastRow (rows below header)
  sheet.appendRow([
    nextNo,
    data.name || "",
    data.profileLink || "",
    data.followers || "",
    data.interestCheckClient || "",
    data.interestCheckKol || "",
    data.ytRemarks || "",
    data.clientRemarks || ""
  ]);
  return { rowIndex: sheet.getLastRow() };
}

function updateKolEntry(clientSheetId, rowIndex, data) {
  var ss = SpreadsheetApp.openById(clientSheetId);
  var sheet = ss.getSheets()[0];
  var colMap = {
    name: 2, profileLink: 3, followers: 4,
    interestCheckClient: 5, interestCheckKol: 6,
    ytRemarks: 7, clientRemarks: 8
  };
  for (var key in data) {
    if (colMap[key]) {
      sheet.getRange(rowIndex, colMap[key]).setValue(data[key]);
    }
  }
}

// ─── SETTINGS FUNCTIONS ───────────────────────────────────────────────────────

function getSettings() {
  var props = PropertiesService.getScriptProperties();
  var picList = props.getProperty("picList");
  var bdList  = props.getProperty("bdList");
  return {
    picList: picList ? JSON.parse(picList) : ["Zi Jian", "YiChing", "Randall", "SimYee"],
    bdList:  bdList  ? JSON.parse(bdList)  : ["WanCi", "Shirley"]
  };
}

function updateSettings(data) {
  var props = PropertiesService.getScriptProperties();
  if (data.picList !== undefined) props.setProperty("picList", JSON.stringify(data.picList));
  if (data.bdList  !== undefined) props.setProperty("bdList",  JSON.stringify(data.bdList));
}
