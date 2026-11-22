type Props = {
  index?: string;
  children: React.ReactNode;
  className?: string;
};

export function SectionLabel({ index, children, className = "" }: Props) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {index && <span className="text-label text-fg">{index}</span>}
      <span aria-hidden className="h-px w-10 bg-olive" />
      <span className="text-label text-muted">{children}</span>
    </div>
  );
}
