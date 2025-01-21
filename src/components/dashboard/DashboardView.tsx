import {
  AlertCircle,
  Inbox,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { Ticket, Team } from "../../types";
import { teamService } from "../../services/team.service";

interface DashboardContext {
  tickets: Ticket[];
}

export function DashboardView() {
  const { tickets } = useOutletContext<DashboardContext>();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data } = await teamService.listTeams();
        setTeams(data);
      } catch (error) {
        console.error('Failed to fetch teams:', error);
      } finally {
        setLoadingTeams(false);
      }
    };

    fetchTeams();
  }, []);

  // Calculate metrics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === "open").length;
  const highPriorityTickets = tickets.filter((t) => t.priority === "high" || t.priority === "urgent").length;

  // Get recent tickets
  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Calculate category distribution
  const categoryStats = tickets.reduce((acc: Record<string, number>, ticket) => {
    acc[ticket.category] = (acc[ticket.category] || 0) + 1;
    return acc;
  }, {});

  const totalForPercentage = Object.values(categoryStats).reduce((a, b) => a + b, 0);

  return (
    <div className="p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-semibold text-gray-900">{totalTickets}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Inbox className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                <p className="text-2xl font-semibold text-gray-900">{openTickets}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Inbox className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-semibold text-gray-900">{highPriorityTickets}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Teams</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loadingTeams ? '...' : teams.length}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tickets & Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Tickets</h2>
              <div className="space-y-4">
                {recentTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ticket.subject}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        ticket.priority === "high" || ticket.priority === "urgent"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Teams</h2>
              {loadingTeams ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {teams.map((team) => (
                    <div key={team.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{team.name}</p>
                        {team.description && (
                          <p className="text-sm text-gray-500">{team.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {!teams.length && (
                    <p className="text-sm text-gray-500 text-center">No teams found</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h2>
              <div className="space-y-4">
                {Object.entries(categoryStats).map(([category, count]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span className="text-sm text-gray-600">
                        {Math.round((count / totalForPercentage) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(count / totalForPercentage) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
