// check for email

export const Utils = {
    isValidEmail: (text: any): boolean => {
      if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(text.trim())) {
        return false;
      }
      return true;
    },
  };
  