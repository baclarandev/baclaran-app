"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Briefcase, Upload } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volunteer: any;
  onSave: (updated: any) => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  volunteer,
  onSave,
}: EditProfileDialogProps) {
  const [formData, setFormData] = useState(volunteer);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Mini inline uploader (fake upload for sample)
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadProgress(30);

      // Simulate async upload
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData({ ...formData, profilePicture: result });
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 500);
        toast.success("Avatar updated (sample)");
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error("Failed to upload avatar");
      setUploadProgress(0);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const inputStyle =
    "bg-blue-900/40 border-blue-700 text-white placeholder:text-blue-200 focus-visible:ring-blue-500";

  const selectStyle =
    "w-full px-3 py-2 rounded-md bg-blue-900/40 border border-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto
       bg-blue-400/20 border-blue-500/30 border text-white backdrop-blur-md shadow-lg rounded-lg
        "
      >
        {/* HEADER */}
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-blue-100">
            Edit Profile
          </DialogTitle>
          <DialogDescription className="text-blue-300">
            Update volunteer information
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-blue-900/60 border border-blue-800">
            <TabsTrigger
              value="personal"
              className="data-[state=active]:bg-blue-600"
            >
              <User className="h-4 w-4 mr-2" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger
              value="professional"
              className="data-[state=active]:bg-blue-600"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Ministry
            </TabsTrigger>
          </TabsList>

          {/* ================= PERSONAL ================= */}
          <TabsContent value="personal" className="space-y-6 pt-6">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="w-24 h-24">
                <AvatarImage src={formData.profilePicture || undefined} />
                <AvatarFallback className="bg-blue-600 text-white text-xl">
                  {formData.firstName?.[0]}
                  {formData.lastName?.[0]}
                </AvatarFallback>
              </Avatar>

              <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors">
                <Upload className="w-4 h-4" />
                Upload Avatar
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>

              {uploadProgress > 0 && (
                <div className="w-full bg-blue-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={inputStyle}
                />
              </div>

              <div>
                <Label>Last Name</Label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={inputStyle}
                />
              </div>

              <div>
                <Label>Middle Initial</Label>
                <Input
                  name="middleInitial"
                  maxLength={1}
                  value={formData.middleInitial}
                  onChange={handleChange}
                  className={inputStyle}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nickname</Label>
                <Input
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  className={inputStyle}
                />
              </div>

              <div>
                <Label>Occupation</Label>
                <Input
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className={inputStyle}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={inputStyle}
              />
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>

            <Input
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={inputStyle}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={inputStyle}
              />

              <select
                name="sex"
                value={formData.sex}
                onChange={(e) =>
                  setFormData({ ...formData, sex: e.target.value })
                }
                className={selectStyle}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <select
              name="civilStatus"
              value={formData.civilStatus}
              onChange={(e) =>
                setFormData({ ...formData, civilStatus: e.target.value })
              }
              className={selectStyle}
            >
              <option>Single</option>
              <option>Married</option>
              <option>Divorced</option>
              <option>Widowed</option>
            </select>

            {/* SACRAMENTS */}
            <div>
              <Label>Sacraments</Label>
              <div className="space-y-2 pt-2">
                {["BAPTISM", "CONFIRMATION", "EUCHARIST"].map((sacrament) => (
                  <label
                    key={sacrament}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="accent-blue-500 w-4 h-4"
                      checked={formData.sacraments.includes(sacrament)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            sacraments: [...formData.sacraments, sacrament],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            sacraments: formData.sacraments.filter(
                              (s: any) => s !== sacrament,
                            ),
                          });
                        }
                      }}
                    />
                    <span className="text-blue-100 text-sm">{sacrament}</span>
                  </label>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ================= MINISTRY ================= */}
          <TabsContent value="professional" className="space-y-6 pt-6">
            <Label>Volunteer Code</Label>
            <Input
              name="volunteerCode"
              value={formData.volunteerCode}
              disabled
              className="bg-blue-950 border-blue-800 text-blue-300"
            />

            <div className="grid grid-cols-2 gap-4">
              <Label>Joined Year on Shrine</Label>
              <Input
                type="number"
                name="joinedYearShrine"
                value={formData.joinedYearShrine}
                onChange={handleChange}
                className={inputStyle}
              />
              <Label>Joined Year on Ministry</Label>
              <Input
                type="number"
                name="joinedYearMinistry"
                value={formData.joinedYearMinistry}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <Label>Classification & Status</Label>
            <div className="grid grid-cols-2 gap-4">
              <select
                className={selectStyle}
                value={formData.classification}
                onChange={(e) =>
                  setFormData({ ...formData, classification: e.target.value })
                }
              >
                <option>REGULAR</option>
                <option>SEASONAL</option>
              </select>

              <select
                className={selectStyle}
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option>ACTIVE</option>
                <option>INACTIVE</option>
                <option>SUSPENDED</option>
              </select>
            </div>
          </TabsContent>
        </Tabs>

        {/* FOOTER BUTTONS */}
        <DialogFooter className="gap-2 pt-4">
          {/* Cancel */}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-blue-600 text-blue-200 hover:bg-blue-800"
          >
            Cancel
          </Button>

          {/* Save */}
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
