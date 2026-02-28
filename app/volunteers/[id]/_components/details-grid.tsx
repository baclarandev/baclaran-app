import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Calendar, Award, Briefcase, User2 } from "lucide-react";
import { motion } from "framer-motion";
import { Volunteer } from "@/lib/data";

const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.1, duration: 0.4 },
  }),
};

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-sm font-medium text-card-foreground">
        {value || "N/A"}
      </p>
    </div>
  );
}

function formatDate(date?: Date) {
  if (!date) return "N/A";
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function DetailsGrid({ volunteer }: { volunteer: Volunteer }) {
  return (
    <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Personal Info */}
      <motion.div
        custom={0}
        variants={cardVariant}
        initial="hidden"
        animate="visible"
      >
        <Card className="h-full rounded-xl bg-blue-500/10 border-blue-500/30 border text-white backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <User2 className="h-4 w-4 text-primary" />
              Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoItem label="Sex" value={volunteer.sex} />
            <InfoItem label="Civil Status" value={volunteer.civilStatus} />
            <InfoItem
              label="Date of Birth"
              value={formatDate(volunteer.dateOfBirth)}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact */}
      <motion.div
        custom={1}
        variants={cardVariant}
        initial="hidden"
        animate="visible"
      >
        <Card className="h-full rounded-xl bg-blue-500/10 border-blue-500/30 border text-white backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoItem label="Phone" value={volunteer.phone || "N/A"} />
            <InfoItem label="Address" value={volunteer.address || "N/A"} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Dates */}
      <motion.div
        custom={2}
        variants={cardVariant}
        initial="hidden"
        animate="visible"
      >
        <Card className="h-full rounded-xl bg-blue-500/10 border-blue-500/30 border text-white backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoItem label="Joined Year" value={volunteer.joinedYear} />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Occupation
              </p>
              <div className="flex items-center gap-1.5 text-sm text-card-foreground">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                {volunteer.occupation || "N/A"}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sacraments */}
      <motion.div
        custom={3}
        variants={cardVariant}
        initial="hidden"
        animate="visible"
      >
        <Card className="h-full rounded-xl bg-blue-500/10 border-blue-500/30 border text-white backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Sacraments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {volunteer.sacraments.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {volunteer.sacraments.map((s: any) => (
                  <Badge
                    key={s}
                    variant="secondary"
                    className="rounded-md text-xs  font-normal"
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No records</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
