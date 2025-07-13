import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";

// Simple QR code generator (SVG)
function QRCode({ value, size = 128 }) {
  // For demo, use a free API (no install needed)
  return (
    <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(value)}&size=${size}x${size}`} alt="QR Code" width={size} height={size} />
  );
}

const events = [
  {
    id: 1,
    name: "ICP Hackathon 2025",
    date: "2025-08-01",
    location: "New York City",
    description: "A global hackathon for ICP developers.",
    ticketId: "ICP2025-001"
  },
  {
    id: 2,
    name: "Web3 Summit",
    date: "2025-09-15",
    location: "San Francisco",
    description: "Summit for Web3 and blockchain enthusiasts.",
    ticketId: "WEB3-2025-002"
  }
];

export default function DigiTicketPage() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen bg-purple-50 p-8">
      <h1 className="text-3xl font-bold mb-8 text-purple-900">Digi Ticket Page</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map(event => (
          <Card key={event.id} className="cursor-pointer hover:shadow-xl transition" onClick={() => setSelected(event)}>
            <CardHeader>
              <CardTitle>{event.name}</CardTitle>
              <CardDescription>{new Date(event.date).toLocaleDateString()}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Modal for event details */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-purple-700 hover:text-purple-900 text-xl" onClick={() => setSelected(null)}>&times;</button>
            <h2 className="text-2xl font-semibold mb-2">{selected.name}</h2>
            <p className="text-purple-700 mb-1">Date: {new Date(selected.date).toLocaleDateString()}</p>
            <p className="text-purple-700 mb-1">Location: {selected.location}</p>
            <p className="mb-4">{selected.description}</p>
            <div className="flex flex-col items-center">
              <QRCode value={selected.ticketId} size={128} />
              <span className="mt-2 text-xs text-gray-500">Ticket ID: {selected.ticketId}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}