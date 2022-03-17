/** メールアドレス正規表現 */
export const REG_EMAIL = /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]{1,}\.[A-Za-z0-9]{1,}$/;
export const REG_SERVICE_TIME = /^[0-9\-\,]+/;  // TODO: 正規表現対応する ex) 1,2-15,1
export const REG_NUMBER = /[0-9]+/;

export const OK_RESPONSE_CODE = [200, 204];
