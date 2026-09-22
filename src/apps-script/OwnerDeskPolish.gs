/** Applies the presentation layer to the verified demo Owner Desk only. @return {!Object} */
function LC_polishOwnerDeskDemo() {
  var lock = LockService.getScriptLock(), result;
  if (!lock.tryLock(5000)) return _LCODP_report_({valid:false,status:'owner_desk_polish_blocked',code:'OWNER_DESK_BUSY'});
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(LC_getSchemaDefinition('OWNER_DESK').sheetName);
    var check = _LCODP_check_(sheet);
    if (!check.valid) return _LCODP_report_(check);
    _LCODP_style_(sheet);
    SpreadsheetApp.flush();
    result = _LCODP_check_(sheet);
    result.status = result.valid ? 'owner_desk_polish_completed' : 'owner_desk_polish_verification_failed';
    result.changedRange = 'A30:H54';
    result.sourceRecordsChanged = 0;
  } catch (error) {
    result = {valid:false,status:'owner_desk_polish_blocked',message:String(error.message || error)};
  } finally {
    lock.releaseLock();
  }
  return _LCODP_report_(result);
}

function _LCODP_check_(sheet) {
  if (!sheet) return {valid:false,status:'owner_desk_polish_blocked',code:'OWNER_DESK_SHEET_UNAVAILABLE'};
  var range = sheet.getRange('A30:H54');
  if (range.getMergedRanges().length) return {valid:false,status:'owner_desk_polish_blocked',code:'OWNER_DESK_MERGE_CONFLICT'};
  var expected = {A37:10900,A40:500,A43:10400,A46:7332,A49:3068};
  var metrics = {}, blockers = [];
  Object.keys(expected).forEach(function (cell) {
    var current = sheet.getRange(cell), value = current.getValue();
    metrics[cell] = value;
    if (value !== expected[cell]) blockers.push({code:'OWNER_DESK_CONTROL_VALUE_MISMATCH',cell:cell,expected:expected[cell],actual:value});
    if (!current.getFormula()) blockers.push({code:'OWNER_DESK_EXPECTED_FORMULA_MISSING',cell:cell});
  });
  var margin = sheet.getRange('F49').getValue();
  if (typeof margin !== 'number' || Math.abs(margin - 0.295) > 0.0000001) blockers.push({code:'OWNER_DESK_MARGIN_MISMATCH',cell:'F49',expected:0.295,actual:margin});
  return {valid:!blockers.length,status:!blockers.length?'owner_desk_verified_for_polish':'owner_desk_polish_blocked',metrics:{revenue:metrics.A37,refunds:metrics.A40,netRevenue:metrics.A43,expenses:metrics.A46,operatingProfit:metrics.A49,operatingMargin:margin},blockers:blockers};
}

function _LCODP_style_(sheet) {
  var whole = sheet.getRange('A30:H54');
  whole.setFontFamily('Arial').setFontColor('#1F2933').setFontSize(10).setVerticalAlignment('middle');
  sheet.setRowHeights(30,25,25);
  sheet.setRowHeight(30,44);
  sheet.setRowHeight(31,25);
  sheet.getRange('A30:H30').setBackground('#17212B').setFontColor('#FFFFFF').setFontSize(16).setFontWeight('bold').setHorizontalAlignment('left');
  sheet.getRange('A31:H31').setFontColor('#64748B').setFontSize(11).setFontStyle('italic');
  sheet.getRange('A33:H33').setBackground('#FFF4D6').setFontColor('#9A6700').setFontWeight('bold').setFontSize(11);
  sheet.getRange('A34:H34').setBackground('#FFF9E8').setFontColor('#9A6700').setFontStyle('italic');

  _LCODP_card_(sheet,'A36:C37','#EFF4F7','#334E68');
  _LCODP_card_(sheet,'A39:C40','#EFF4F7','#334E68');
  _LCODP_card_(sheet,'A42:C43','#E1F2EA','#146C43');
  _LCODP_card_(sheet,'A45:C46','#F5F7F9','#475569');
  _LCODP_card_(sheet,'A48:C49','#E1F2EA','#146C43');
  _LCODP_card_(sheet,'A51:C52','#F5F7F9','#475569');
  sheet.getRange('A37').setNumberFormat('#,##0" ₽"').setFontSize(15).setFontWeight('bold');
  sheet.getRange('A40').setNumberFormat('#,##0" ₽"').setFontSize(15).setFontWeight('bold');
  sheet.getRange('A43').setNumberFormat('#,##0" ₽"').setFontSize(16).setFontWeight('bold');
  sheet.getRange('A46').setNumberFormat('#,##0" ₽"').setFontSize(15).setFontWeight('bold');
  sheet.getRange('A49').setNumberFormat('#,##0" ₽"').setFontSize(16).setFontWeight('bold');

  sheet.getRange('F36:H40').setBackground('#F8FAFC');
  sheet.getRange('F36:F40').setFontWeight('bold').setFontColor('#475569');
  sheet.getRange('H36:H40').setNumberFormat('#,##0" ₽"').setFontWeight('bold').setHorizontalAlignment('right');
  sheet.getRange('F48:H49').setBackground('#E1F2EA');
  sheet.getRange('F48').setFontWeight('bold').setFontColor('#146C43');
  sheet.getRange('F49').setNumberFormat('0.0%').setFontSize(16).setFontWeight('bold').setFontColor('#146C43');
  sheet.getRange('A54:H54').setFontColor('#64748B').setFontSize(9).setFontStyle('italic');
}

function _LCODP_card_(sheet, a1, background, color) {
  var range = sheet.getRange(a1);
  range.setBackground(background);
  sheet.getRange(a1.split(':')[0]).setFontWeight('bold').setFontColor(color).setFontSize(11);
}
function _LCODP_report_(result) { Logger.log(JSON.stringify(result)); return result; }
