import { type ComponentProps } from 'react';

import { cn } from '../../lib/utils';

function Table({ className, ref, ...props }: ComponentProps<'table'>) {
  return (
    <table ref={ref} className={cn('w-full text-left', className)} {...props} />
  );
}

function TableHeader({ className, ref, ...props }: ComponentProps<'thead'>) {
  return (
    <thead
      ref={ref}
      className={cn('[&_tr]:bg-gray-50', className)}
      {...props}
    />
  );
}

function TableBody({ className, ref, ...props }: ComponentProps<'tbody'>) {
  return <tbody ref={ref} className={className} {...props} />;
}

function TableFooter({ className, ref, ...props }: ComponentProps<'tfoot'>) {
  return <tfoot ref={ref} className={className} {...props} />;
}

function TableRow({ className, ref, ...props }: ComponentProps<'tr'>) {
  return (
    <tr
      ref={ref}
      className={cn(
        'border-b border-gray-200 last:border-b-0 transition-colors duration-150',
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ref, ...props }: ComponentProps<'th'>) {
  return (
    <th
      ref={ref}
      scope="col"
      className={cn(
        'px-5 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap',
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ref, ...props }: ComponentProps<'td'>) {
  return (
    <td
      ref={ref}
      className={cn(
        'px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap',
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ref, ...props }: ComponentProps<'caption'>) {
  return <caption ref={ref} className={cn('sr-only', className)} {...props} />;
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
};
