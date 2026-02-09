"use client";


import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trash2, Pencil, Church } from "lucide-react";
import { ICON_OPTIONS } from "./ministries-container";

export const MinistryTypeBadge = ({ type }: { type: "LITURGICAL" | "PASTORAL" }) => {
  const color =
    type === "LITURGICAL"
      ? "bg-blue-500 text-white"
      : "bg-green-500 text-white";
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color} ml-2`}>
      {type === "LITURGICAL" ? "Liturgical" : "Pastoral"}
    </span>
  );
};

export const MinistryCard = ({ ministry, volunteerCount, canManage, onEdit, onDelete, canViewMembers, user }: any) => {
  const IconComp =
    ICON_OPTIONS.find((i) => i.name === ministry.icon)?.icon || Church;

  return (
    <Card className="relative bg-gray-800 border border-white/10 hover:border-[#d4af37]/40 transition-all group">
      <div className="absolute left-0 top-0 h-full w-1 bg-[#d4af37]" />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <IconComp className="w-10 h-10 text-yellow-400 mb-2" />
          {canViewMembers(ministry) && (
            <Link href={`/ministries/${ministry.id}`}>
              <Button
                size="sm"
                variant="outline"
                className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/10"
              >
                View Members
              </Button>
            </Link>
          )}
        </div>
        <Link href={`/ministries/${ministry.id}`}>
          <CardTitle className="text-white text-lg group-hover:text-[#d4af37] transition-colors">
            {ministry.name}
          </CardTitle>
        </Link>
        <CardDescription className="text-gray-400">
          {volunteerCount || 0} Volunteers Active{" "}
          {ministry.type && <MinistryTypeBadge type={ministry.type} />}
        </CardDescription>
      </CardHeader>
      {canManage && (
        <CardContent className="flex justify-end gap-1 pt-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(ministry)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(ministry)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </CardContent>
      )}
    </Card>
  );
};
