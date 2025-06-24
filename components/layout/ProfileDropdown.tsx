"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";

// Define the user type
interface User {
  name: string;
  email: string;
  role: string;
}

export default function ProfileDropdown({ user }: { user: User }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div
        className="flex items-center cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-400 flex items-center justify-center text-white font-bold text-xl">
          {user.email[0].toUpperCase()}
        </div>
        <div className="ml-3">
          <div className="font-medium">{user.email}</div>
          <div className="text-xs text-gray-500">{user.role}</div>
        </div>
      </div>
      {open && (
        <Card className="absolute right-0 mt-2 w-48 shadow-lg z-50 p-2">
          <div className="flex flex-col">
            <Button
              variant="ghost"
              className="justify-start w-full mb-1"
              onClick={() => {
                window.location.href = "/dashboard/admin/profile";
              }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button
              variant="ghost"
              className="justify-start w-full text-red-600 hover:bg-red-50"
              onClick={() => {
                // TODO: Add logout logic here
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
} 