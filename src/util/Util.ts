
interface utilType {
  getUUID: (() => string),
}

/**
 *  Collection of Util functions
 */
export const Util: utilType = {
  getUUID : () : string => {
    const S4 = function () {
      return Math.floor(Math.random() * 0x10000 /* 65536 */).toString(16);
    };

    return (
      S4() + S4() + '-' +
      S4() + '-' +
      S4() + '-' +
      S4() + '-' +
      S4() + S4() + S4()
    );
  },
}
