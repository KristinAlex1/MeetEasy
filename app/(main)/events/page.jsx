"use client";

import { getUserEvents } from "@/actions/events";
import EventCard from "@/components/event-card";
import { Suspense, useEffect, useState } from "react";


export default function EventsPage() {
  return (
    <Suspense fallback={<div>Loading Events...</div>}>
      <Events />
    </Suspense>
  );
}

function Events() {
  const [events, setEvents] = useState([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { events, username } = await getUserEvents();
        setEvents(events);
        setUsername(username);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <div>Loading Events...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (events.length === 0) {
    return <p>You haven't created any events yet.</p>;
  }

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      {events.map((event) => (
        <EventCard key={event.id} event={event} username={username} />
      ))}
    </div>
  );
}