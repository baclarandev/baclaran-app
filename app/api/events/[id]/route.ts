import { NextRequest, NextResponse } from "next/server";

// Mock database (replace with real DB in production)
let events = [
  {
    id: 1,
    title: "Community Clean-Up",
    description: "Neighborhood park cleaning event",
    startDate: "2026-03-01T09:00:00Z",
    endDate: "2026-03-01T12:00:00Z",
    attendance: [
      {
        id: 101,
        volunteer: { id: 1, firstName: "John", lastName: "Doe", email: "john@example.com" },
        session: "AM",
        status: "PENDING",
        response: "NO_RESPONSE",
      },
      {
        id: 102,
        volunteer: { id: 2, firstName: "Jane", lastName: "Smith" },
        session: "PM",
        status: "CONFIRMED",
        response: "CAN_ATTEND",
      },
    ],
  },
];

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const eventId = parseInt(params.id, 10);
  const event = events.find((e) => e.id === eventId);

  if (!event) return NextResponse.json({ message: "Event not found" }, { status: 404 });

  return NextResponse.json(event);
}