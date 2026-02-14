import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Volunteer } from "@/lib/data";

export function FormationsTimelines({ volunteer }: { volunteer: Volunteer }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Formations */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <Card className="rounded-xl bg-blue-500/10 border-blue-500/30 border text-white backdrop-blur-md h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Formations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {volunteer.formations.length > 0 ? (
              <div className="space-y-3">
                {volunteer.formations.map((f) => (
                  <div key={f.id} className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        {f.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{f.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No formations recorded
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Timelines */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <Card className="rounded-xl bg-blue-500/10 border-blue-500/30 border text-white backdrop-blur-md h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Service Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {volunteer.timelines.length > 0 ? (
              <div className="relative pl-4 border-l-2 border-primary/20 space-y-4">
                {volunteer.timelines.map((t: any) => (
                  <div key={t.id} className="relative">
                    <div className="absolute -left-[1.3rem] top-1 h-3 w-3 rounded-full border-2 border-primary bg-card" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        {t.organization}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {t.startYear} — {t.endYear ?? "Present"}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 h-4"
                        >
                          {t.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No timelines recorded
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
