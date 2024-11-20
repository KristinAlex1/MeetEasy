"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usernameSchema } from "@/app/lib/validators";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import { updateUsername } from "@/actions/user";

const Dashboard = () => {
  const { isLoaded, user, isSignedIn } = useUser();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: "",
    },
  });

  const onSubmit = async (data) => {
    if (!isSignedIn) {
      setServerError("Please sign in to update your username");
      return;
    }

    try {
      setLoading(true);
      setServerError(null);

      const result = await updateUsername(data.username);
      
      if (result.error) {
        throw new Error(result.error);
      }

      setValue("username", result.username);
      
    } catch (error) {
      console.error("Error saving username:", error);
      setServerError(error.message || "Failed to update username");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <BarLoader color="#36d7b7" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Please Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You must be signed in to update your username</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user?.firstName || "User"}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Unique Link</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span>{window?.location.origin}/</span>
                <Input
                  {...register("username")}
                  type="text"
                  placeholder="Username"
                  className="border rounded-md px-2 py-1"
                  disabled={loading}
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
              )}
              {serverError && (
                <p className="text-red-500 text-sm mt-1">{serverError}</p>
              )}
            </div>
            {loading && (
              <BarLoader className="mb-4" width="100%" color="#36d7b7" />
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Update Username"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;