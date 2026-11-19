
/**
 * VI client microsite: receives the team scoping (pre-training) survey into a Google Sheet.
 *
 * Set-up (once):
 *   1. Open the Google Sheet that should collect responses. Extensions > Apps Script.
 *   2. Replace everything in Code.gs with this script and save.
 *   3. Deploy > New deployment > type "Web app". Execute as: Me. Who has access: Anyone. Deploy and allow access.
 *   4. Copy the Web app URL (it ends in /exec) into the builder, under Client microsite.
 * After editing this script later, use Deploy > Manage deployments > Edit > New version, so the URL stays the same.
 *
 * Each response becomes one row in a "Pre-training survey" tab. One Sheet can serve every client:
 * the Client and Proposal columns say which microsite a row came from.
 */
var NOTIFY_EMAIL = '';   // optional: your email address, to be told when a response arrives

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var d = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = sheet_(ss, 'Pre-training survey', ['Received', 'Client', 'Proposal', 'Name', 'Department', 'Course(s)', 'Top three tasks', 'Software or tools', 'Biggest frustration or bottleneck', 'Task to do faster or more easily']);
    sh.appendRow([new Date(), s_(d.client), s_(d.proposal), s_(d.name), s_(d.department), s_((d.courses || []).join('; ')), s_(d.tasks), s_(d.tools), s_(d.frustration), s_(d.faster)]);
    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(NOTIFY_EMAIL, 'Pre-training survey: ' + (d.client || 'client microsite'), String(d.summary || '').slice(0, 20000));
    }
    return out_({ok: true});
  } catch (err) {
    return out_({ok: false, error: String(err)});
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('The VI microsite survey receiver is running.');
}

function sheet_(ss, name, head) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) { sh.appendRow(head); sh.setFrozenRows(1); sh.getRange(1, 1, 1, head.length).setFontWeight('bold'); }
  return sh;
}

/* Text only, never a formula: a leading =, +, - or @ is kept as plain text */
function s_(v) {
  var t = v == null ? '' : String(v);
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
