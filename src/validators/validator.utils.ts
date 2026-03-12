export const validator = (schema: any) => (payload: any) =>
    schema.validate(payload, { abortEarly: false });
  