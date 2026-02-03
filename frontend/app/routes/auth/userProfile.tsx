import { useState, useEffect } from "react";
import { useAuth } from "@/provider/authContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, User as UserIcon, Lock } from "lucide-react";
import { useUpdateProfileMutation, useUpdatePasswordMutation } from "@/hooks/useProfileHook";
import { updateProfileSchema, updatePasswordSchema } from "@/lib/schema";

export async function loader() {
  return null; 
}

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const updateProfileMutation = useUpdateProfileMutation();
  const updatePasswordMutation = useUpdatePasswordMutation();
  
  const [name, setName] = useState(user?.name || "");
  const [hasProfileChanges, setHasProfileChanges] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  useEffect(() => {
    setHasProfileChanges(name.trim() !== user?.name);
  }, [name, user?.name]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = updateProfileSchema.parse({ name: name.trim() });

      await updateProfileMutation.mutateAsync(validatedData, {
        onSuccess: (updatedUser) => {
  
          updateUser(updatedUser);
          
          toast.success("Profile updated successfully", {
            description: "Your profile information has been saved.",
          });
          
          setHasProfileChanges(false);
        },
        onError: (error: any) => {
          throw error;
        },
      });
    } catch (error: any) {
    
      if (error.errors) {
        toast.error("Validation Error", {
          description: error.errors[0]?.message || "Please check your input.",
        });
      } else {
        toast.error("Failed to update profile", {
          description: error.response?.data?.message || error.message || "Please try again.",
        });
      }
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {

      const validatedData = updatePasswordSchema.parse({
        oldPassword,
        newPassword,
        confirmPassword,
      });

      if (oldPassword === newPassword) {
        toast.error("Validation Error", {
          description: "New password must be different from the current password.",
        });
        return;
      }

      await updatePasswordMutation.mutateAsync(
        {
          oldPassword: validatedData.oldPassword,
          newPassword: validatedData.newPassword,
        },
        {
          onSuccess: () => {
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");

            toast.success("Password updated successfully", {
              description: "Your password has been changed.",
            });
          },
          onError: (error: any) => {
            throw error;
          },
        }
      );
    } catch (error: any) {
      if (error.errors) {
        toast.error("Validation Error", {
          description: error.errors[0]?.message || "Please check your input.",
        });
      } else {
        toast.error("Failed to update password", {
          description: error.response?.data?.message || error.message || "Please try again.",
        });
      }
    }
  };

  const handleProfileCancel = () => {
    setName(user?.name || "");
    setHasProfileChanges(false);
  };

  const handlePasswordCancel = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            <CardTitle>My Profile</CardTitle>
          </div>
          
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
          
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                disabled={updateProfileMutation.isPending}
              />
              
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
              
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                type="text"
                value={user?.role || ""}
                disabled
                className="bg-muted capitalize"
              />
            </div>

            {user?.created_at && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">Member Since</Label>
                <p className="text-sm">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleProfileCancel}
                disabled={updateProfileMutation.isPending || !hasProfileChanges}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateProfileMutation.isPending || !hasProfileChanges}
              >
                {updateProfileMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle>Change Password</CardTitle>
          </div>
          
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
      
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Current Password</Label>
              <Input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                required
                disabled={updatePasswordMutation.isPending}
                autoComplete="current-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                disabled={updatePasswordMutation.isPending}
                autoComplete="new-password"
              />
              
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={updatePasswordMutation.isPending}
                autoComplete="new-password"
              />
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-destructive">
                  Passwords do not match
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              
        <Button
  type="button"
  variant="outline"
  onClick={handlePasswordCancel}
  disabled={
    updatePasswordMutation.isPending || 
    (!oldPassword && !newPassword && !confirmPassword)
  }
>
  Cancel
</Button>
<Button 
  type="submit" 
  disabled={
    updatePasswordMutation.isPending || 
    !oldPassword || 
    !newPassword || 
    !confirmPassword ||
    newPassword !== confirmPassword
  }
>
  {updatePasswordMutation.isPending && (
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  )}
  Update Password
</Button>

            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;