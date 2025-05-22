/* eslint-disable @typescript-eslint/no-wrapper-object-types */
"use client";

import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faUser,
  faEnvelope,
  faPhone,
  faBell,
  faShieldAlt,
  faCamera,
} from "@fortawesome/free-solid-svg-icons";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type StaffProfile = {
  fullName: string;

  email: string;

  phoneNumber: string;

  photoUrl?: string;
};

type PasswordUpdate = {
  currentPassword: string;

  newPassword: string;

  confirmNewPassword: string;
};

type NotificationPreferences = {
  email: Boolean;

  sms: Boolean;

  system: Boolean;

  maintenance: Boolean;
};

export default function StaffSettings() {
  const [profile, setProfile] = useState<StaffProfile>({
    fullName: "Staff Admin",

    email: "admin@sigaurc.rw",

    phoneNumber: "+250 788 123 456",
  });

  const [password, setPassword] = useState<PasswordUpdate>({
    currentPassword: "",

    newPassword: "",

    confirmNewPassword: "",
  });

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email: true,

    sms: true,

    system: true,

    maintenance: true,
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };

  const handleNotificationToggle = (name: keyof NotificationPreferences) => {
    setNotifications((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSubmit = () => {
    // Save logic here

    console.log({ profile, password, notifications });

    toast.success("Settings updated successfully");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Staff Settings</h1>

        <div className="flex gap-3">
          <Button variant="outline" className="px-6">
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            className="px-6 bg-blue-600 hover:bg-blue-700"
          >
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Profile */}

        <div className="md:col-span-1">
          <Card className="p-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-4xl text-gray-400"
                  />
                </div>

                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                  <FontAwesomeIcon icon={faCamera} className="text-sm" />
                </button>
              </div>

              <h2 className="mt-4 text-xl font-semibold">{profile.fullName}</h2>

              <p className="text-gray-500">{profile.email}</p>
            </div>
          </Card>
        </div>

        {/* Right Column - Settings */}

        <div className="md:col-span-2 space-y-6">
          {/* Profile Information */}

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Profile Information</h3>

            <div className="space-y-4">
              <div className="relative">
                <FontAwesomeIcon
                  icon={faUser}
                  className="absolute left-3 top-3 text-gray-400"
                />

                <Input
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleProfileChange}
                  placeholder="Full Name"
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="absolute left-3 top-3 text-gray-400"
                />

                <Input
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  placeholder="Email"
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="absolute left-3 top-3 text-gray-400"
                />

                <Input
                  name="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={handleProfileChange}
                  placeholder="Phone Number"
                  className="pl-10"
                />
              </div>
            </div>
          </Card>

          {/* Security Settings */}

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Security Settings</h3>

            <div className="space-y-4">
              <div className="relative">
                <FontAwesomeIcon
                  icon={faShieldAlt}
                  className="absolute left-3 top-3 text-gray-400"
                />

                <Input
                  type="password"
                  name="currentPassword"
                  value={password.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Current Password"
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <FontAwesomeIcon
                  icon={faShieldAlt}
                  className="absolute left-3 top-3 text-gray-400"
                />

                <Input
                  type="password"
                  name="newPassword"
                  value={password.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="New Password"
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <FontAwesomeIcon
                  icon={faShieldAlt}
                  className="absolute left-3 top-3 text-gray-400"
                />

                <Input
                  type="password"
                  name="confirmNewPassword"
                  value={password.confirmNewPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm New Password"
                  className="pl-10"
                />
              </div>
            </div>
          </Card>

          {/* Notification Preferences */}

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faBell} className="text-gray-400" />

              <h3 className="text-lg font-semibold">
                Notification Preferences
              </h3>
            </div>

            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, " $1")} Notifications
                  </span>

                  <Switch
                    checked={value}
                    onCheckedChange={() =>
                      handleNotificationToggle(
                        key as keyof NotificationPreferences
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
