import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProfileDropdown from "@/components/layout/ProfileDropdown";

// Note: This page is accessible at /dashboard/admin/profile

export default function SuperAdminProfile() {
  // Fetch user data here (hardcoded or via API)
  const user = {
    name: "Super Admin",
    email: "admin@example.com",
    role: "Super Admin",
    organization: "IMOTRAK",
    // avatar: "/path/to/avatar.png"
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <div className="flex flex-col items-center p-6">
          {/* <Avatar src={user.avatar} /> */}
          <h2 className="text-2xl font-bold mt-4">{user.name}</h2>
          <p className="text-gray-500">{user.email}</p>
          <p className="text-sm text-gray-400">{user.role}</p>
          <p className="mt-2">{user.organization}</p>
          <Button className="mt-4">Edit Profile</Button>
          <Button variant="outline" className="mt-2">Change Password</Button>
        </div>
      </Card>
      <ProfileDropdown user={{
        name: "Admin",
        email: "admin@imotarak.rw",
        role: "Admin"
      }} />
    </div>
  );
} 