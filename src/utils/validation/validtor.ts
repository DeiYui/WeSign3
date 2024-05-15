import { trim } from "lodash";

// Validate trường bắt buộc nhập
export function validateRequire(message: any) {
  return {
    required: true,
    message: message || "Vui lòng không bỏ trống mục này",
  };
}

// Validate truong chi nhap khoang trang
export function validateRequireInput(message?: any, required = true) {
  return {
    required,
    validator: (_: any, value: string) => {
      if (!required) return Promise.resolve();
      if (!!value && trim(value) !== "") {
        return Promise.resolve();
      }

      return Promise.reject(message || "Vui lòng không bỏ trống mục này");
    },
  };
}

export function validateRequireComboboxAcceptZero(message: any) {
  return {
    required: true,
    validator: (value: any) => {
      if ((!!value && trim(value) !== "") || value === 0) {
        return Promise.resolve();
      }

      return Promise.reject(message || "Vui lòng không bỏ trống mục này");
    },
  };
}

export function validateEmail(message: string) {
  return {
    validator: (_: any, value: string) => {
      if (value && value.length) {
        const re =
          /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9]{2,}(?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
        if (re.test(value)) {
          return Promise.resolve();
        }

        return Promise.reject(message || "Vui lòng nhập đúng định dạng");
      }

      return Promise.resolve();
    },
  };
}
