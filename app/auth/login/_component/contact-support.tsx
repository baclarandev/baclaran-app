"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

const ContactSupportModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        className="w-full text-blue-300 hover:text-blue-200 hover:bg-blue-500/10"
        onClick={() => setIsOpen(true)}
      >
        Contact Support
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle>Contact Support</DialogTitle>
            <DialogDescription className="mt-2 text-stone-300">
              You can reach out to our support team at:
            </DialogDescription>
          </DialogHeader>

          <div className="my-4">
            <p className="font-medium text-blue-300 select-all text-center">
              <a href="mailto:baclarandev@gmail.com">baclarandev@gmail.com</a>
            </p>
            <p className="mt-2 text-stone-400 text-sm text-center">
              Click the email to open your email client and send a message.
            </p>
          </div>

          <DialogFooter className="flex justify-end">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContactSupportModal;
