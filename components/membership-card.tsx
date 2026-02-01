import Image from "next/image";
import ChurchLogo from "@/public/LOGO.png";

interface MembershipCardProps {
  memberId: string;
  memberName: string;
  ministry?: string;
}

const MembershipCard = ({
  memberId,
  memberName,
  ministry,
}: MembershipCardProps) => {
  return (
    <div className="membership-card w-full max-w-[380px] aspect-[1.586/1] rounded-2xl p-6 relative overflow-hidden animate-float">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 shimmer-effect pointer-events-none" />

      {/* Card pattern background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 right-4 w-32 h-32 border border-primary/20 rounded-full" />
        <div className="absolute top-8 right-8 w-24 h-24 border border-primary/20 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 border border-primary/20 rounded-full" />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center pulse-gold">
            <div className="w-10 h-10  flex items-center justify-center">
              <Image
                src={ChurchLogo}
                alt="Baclaran Church Logo"
                width={28}
                height={28}
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Member
            </p>
            <p className="font-display text-sm text-primary">Baclaran Church</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            VMS
          </p>
        </div>
      </div>

      {/* Chip */}
      <div className="relative mb-6">
        <div className="card-chip w-12 h-9 rounded-md flex items-center justify-center">
          <div className="w-8 h-6 border border-primary-foreground/30 rounded-sm grid grid-cols-3 grid-rows-2 gap-[1px] p-[2px]">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-primary-foreground/20 rounded-[1px]" />
            ))}
          </div>
        </div>
      </div>

      {/* Member ID */}
      <div className="relative mb-4">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">
          Member ID
        </p>
        <p className="font-display text-2xl tracking-[0.3em] gold-text font-semibold">
          {memberId}
        </p>
      </div>

      {/* Member Name & Ministry */}
      <div className="relative space-y-1">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Cardholder
        </p>

        <p className="font-display text-lg tracking-wide text-card-foreground uppercase leading-tight">
          {memberName}
        </p>

        {ministry && (
          <p className="text-xs uppercase tracking-widest text-primary/80">
            {ministry}
          </p>
        )}
      </div>

      {/* Decorative lines */}
      <div className="absolute bottom-6 right-6 flex gap-1">
        <div className="w-8 h-[2px] bg-primary/30" />
        <div className="w-4 h-[2px] bg-primary/50" />
        <div className="w-2 h-[2px] bg-primary" />
      </div>
    </div>
  );
};

export default MembershipCard;
