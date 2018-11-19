import React from 'react';

export const INTERNAL_RETURN_TYPE = 'INTERNAL_RETURN_TYPE';

export const createReturn = value =>
  React.createElement(INTERNAL_RETURN_TYPE, { value });

export default createReturn;
