import { parseISO, format } from 'date-fns';

import React from 'react';

type DateProps = {
  dateString: string;
};

const DateComponent: React.FC<DateProps> = ({ dateString }) => {
  const date = parseISO(dateString);
  return <time dateTime={dateString}>{format(date, 'LLLL d, yyyy')}</time>;
}

export default DateComponent;
