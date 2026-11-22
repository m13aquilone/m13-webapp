type Props = {
  id: string;
  children: React.ReactNode;
  /** Small factual annotation shown beside the heading, e.g. "(03)". */
  aside?: React.ReactNode;
  className?: string;
};

export function SectionHeading({ id, children, aside, className = "" }: Props) {
  return (
    <div data-reveal className={`flex items-end justify-between gap-6 ${className}`}>
      <h2 id={id} className="wdth-wide text-headline font-[680] text-fg">
        {children}
      </h2>
      {aside && <span className="text-label shrink-0 pb-2 text-muted">{aside}</span>}
    </div>
  );
}
