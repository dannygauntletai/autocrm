import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Inbox, Users } from "lucide-react";
import { LogoutButton } from "../auth/LogoutButton";
import { ticketService } from "../../services/ticket.service";
import { useProfile } from "../../hooks/useProfile";
import type { Ticket } from "../../types";

export function DashboardLayout() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { getCurrentProfile } = useProfile();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const profile = await getCurrentProfile();
      setIsAdmin(profile.role === 'admin');
    };
    checkAdmin();
  }, [getCurrentProfile]);

  const fetchTickets = async () => {
    try {
      const tickets = await ticketService.getTickets();
      setTickets(tickets);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <nav className="w-64 bg-gray-900 text-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-semibold">Help Desk</h1>
        </div>
        <div className="flex-1">
          <div className="px-4 py-2 text-sm text-gray-400">MAIN</div>
          <button
            onClick={() => navigate("/dashboard")}
            className={`w-full flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-800 ${
              location.pathname === "/dashboard" ? "bg-gray-800" : ""
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => navigate("/tickets")}
            className={`w-full flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-800 ${
              location.pathname.startsWith("/tickets") ? "bg-gray-800" : ""
            }`}
          >
            <Inbox size={18} />
            <span>Tickets</span>
          </button>
          <button
            onClick={() => navigate("/teams")}
            className={`w-full flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-800 ${
              location.pathname.startsWith("/teams") ? "bg-gray-800" : ""
            }`}
          >
            <Users size={18} />
            <span>Teams</span>
          </button>
          {isAdmin && (
            <div className="px-4 py-2 mt-4">
              <div className="text-sm text-gray-400">ADMIN</div>
              <button
                onClick={() => navigate("/admin/agents")}
                className={`w-full flex items-center space-x-2 py-2 text-gray-300 hover:bg-gray-800 ${
                  location.pathname === "/admin/agents" ? "bg-gray-800" : ""
                }`}
              >
                <Users size={18} />
                <span>Manage Agents</span>
              </button>
            </div>
          )}
        </div>
        <div className="mt-auto border-t border-gray-800 p-4">
          <LogoutButton />
        </div>
      </nav>
      <div className="flex-1 overflow-auto">
        <Outlet context={{
          tickets,
          fetchTickets,
          selectedTicketId,
          setSelectedTicketId
        }} />
      </div>
    </div>
  );
} 