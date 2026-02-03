import { resetPasswordSchema } from "@/lib/schema";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {Card,CardContent,CardDescription,CardFooter,CardHeader,CardTitle,} from "@/components/ui/card";
import {Form,FormControl,FormField,FormItem,FormLabel,FormMessage,} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router";
import { useResetPasswordMutation } from "@/hooks/useAuthHook";
import { toast } from "sonner";
import { Loader2, KeyRound, CheckCircle2 } from "lucide-react";

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate, isPending } = useResetPasswordMutation();

  const handleOnSubmit = (values: ResetPasswordFormData) => {
    mutate(
      { token: token as string, password: values.password },
      {
        onSuccess: () => {
          setIsSubmitted(true);
        },
        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.message || "An error occurred";
          toast.error(errorMessage);
        },
      }
    );
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader className="text-center mb-5">
            <CardTitle className="text-2xl font-bold">Invalid link</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              This reset link is missing or invalid. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CardFooter className="flex items-center justify-center mt-2">
              <Link to="/forgot-password" className="text-sm text-blue-600">
                Request a new reset link
              </Link>
            </CardFooter>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader className="text-center mb-5">
            <div className="flex justify-center mb-3">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Password reset successfully
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Your password has been updated. You can now sign in with your new
              password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CardFooter className="flex items-center justify-center mt-2">
              <Link to="/sign-in" className="text-sm text-blue-600">
                Back to Sign In
              </Link>
            </CardFooter>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center mb-5">
          <div className="flex justify-center mb-3">
            <KeyRound className="w-10 h-10 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Create new password
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Enter your new password below. This link will expire in 15 minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleOnSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="***········"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="***········"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </Form>
          <CardFooter className="flex items-center justify-center mt-6">
            <div className="flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link to="/sign-in" className="text-blue-600">
                  Sign In
                </Link>
              </p>
            </div>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;