import React, { forwardRef } from 'react';

export const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ 
  className,
  ...props
}, ref) => <div ref={ref} className="rounded-lg border bg-card text-card-foreground shadow-sm" {...props} />);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ 
  className,
  ...props
}, ref) => <div ref={ref} className="flex flex-col space-y-1.5 p-6" {...props} />);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ 
  className,
  ...props
}, ref) => <h3 ref={ref} className="text-2xl font-semibold leading-none tracking-tight" {...props} />);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ 
  className,
  ...props
}, ref) => <p ref={ref} className="text-sm text-muted-foreground" {...props} />);
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ 
  className,
  ...props
}, ref) => <div ref={ref} className="p-6 pt-0" {...props} />);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ 
  className,
  ...props
}, ref) => <div ref={ref} className="flex items-center p-6 pt-0" {...props} />);
CardFooter.displayName = 'CardFooter';