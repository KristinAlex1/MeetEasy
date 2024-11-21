// FILE: app/(main)/dashboard/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BarLoader } from "react-spinners";
import { usernameSchema } from "@/app/lib/validators";

const Dashboard = () => {
  const { isLoaded, user } = useUser();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: "", // Initial value
    },
  });

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserData();
    }
  }, [isLoaded, user]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch('/api/get-user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const contentType = response.headers.get("content-type");
      console.log('Response Content-Type:', contentType);
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error("Received non-JSON response");
      }

      const data = await response.json();
      if (response.ok) {
        setValue("username", data.username);
      } else {
        setServerError(data.error);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const currentUsername = getValues("username");
      if (data.username === currentUsername) {
        console.log("Username is unchanged.");
        setLoading(false);
        return;
      }
      const token = await getToken();
      const response = await fetch("/api/updateUsername", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the session token
        },
        body: JSON.stringify({ username: data.username }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error("Received non-JSON response");
      }

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to update username");
      }

      console.log("Username updated successfully:", result);
      setServerError(null); // Clear any server error messages
    } catch (error) {
      console.error("Error updating username:", error.message);
      setServerError("Failed to update username. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user?.firstName || "User"}</CardTitle>
        </CardHeader>
      </Card>

      {/* Unique Link Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Unique Link</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span>{window?.location.origin}/</span>
                {/* Username Input */}
                <Input
                  {...register("username")}
                  type="text"
                  placeholder="Username"
                  className="border rounded-md px-2 py-1"
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