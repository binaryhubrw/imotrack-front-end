import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";

// The design is based on the provided figma screenshot.

export default function SuperAdminProfile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Loading profile...</div>
      </div>
    );
  }

  const getInitials = (nameOrEmail: string) => {
    return nameOrEmail
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column for profile summary */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="flex flex-col items-center text-center p-6">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarFallback>{getInitials(user.name || user.email || "S A")}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{user.name || user.email}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-sm text-gray-400">{user.role}</p>
              <Badge className="mt-2">Active</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Organization
                  </span>
                  <span className="text-sm">IMOTRAK</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-6">
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right column for personal information and security */}
        <div className="md:col-span-2">
          <Tabs defaultValue="personal-info">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal-info">
                Personal Information
              </TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            <TabsContent value="personal-info">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Manage your personal details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue={user.name || user.email} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user.email} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" defaultValue={user.role} readOnly />
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>
                    Manage your security settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button>Change Password</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 