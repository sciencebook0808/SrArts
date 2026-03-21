'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Image,
  FolderOpen,
  FileText,
  ShoppingCart,
  MessageSquare,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Search,
} from 'lucide-react';
import Link from 'next/link';

type TabType = 'overview' | 'artworks' | 'categories' | 'blog' | 'orders' | 'support';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { label: 'Total Artworks', value: '48', icon: Image },
    { label: 'Blog Posts', value: '12', icon: FileText },
    { label: 'Orders', value: '24', icon: ShoppingCart },
    { label: 'Support Tickets', value: '3', icon: MessageSquare },
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'artworks', label: 'Artworks', icon: Image },
    { id: 'categories', label: 'Categories', icon: FolderOpen },
    { id: 'blog', label: 'Blog Posts', icon: FileText },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'support', label: 'Support Tickets', icon: MessageSquare },
  ];

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-white hidden md:flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold gradient-text">SR Arts</h1>
          <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon as any;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  activeTab === item.id
                    ? 'bg-primary text-white'
                    : 'text-foreground hover:bg-accent-subtle'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-red-50 transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 border-b border-border bg-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {sidebarItems.find((item) => item.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-4">
            {activeTab !== 'overview' && (
              <Link
                href={`/admin/dashboard/${activeTab}/new`}
                className="btn-base bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light flex items-center gap-2 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add New
              </Link>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab stats={stats} />}
          {activeTab === 'artworks' && (
            <TableSection title="Artworks" items={mockArtworks} columns={['Title', 'Category', 'Status', 'Views']} />
          )}
          {activeTab === 'categories' && (
            <TableSection title="Categories" items={mockCategories} columns={['Name', 'Artworks', 'Status']} />
          )}
          {activeTab === 'blog' && (
            <TableSection title="Blog Posts" items={mockBlogPosts} columns={['Title', 'Author', 'Status', 'Views']} />
          )}
          {activeTab === 'orders' && (
            <TableSection title="Orders" items={mockOrders} columns={['Customer', 'Amount', 'Status', 'Date']} />
          )}
          {activeTab === 'support' && (
            <TableSection title="Support Tickets" items={mockTickets} columns={['Subject', 'Status', 'Priority', 'Date']} />
          )}
        </div>
      </main>
    </div>
  );
}

function OverviewTab({ stats }: { stats: any[] }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card-base p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-primary mt-2">{stat.value}</p>
                </div>
                <Icon className="w-8 h-8 text-primary/20" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="card-base p-6">
        <h3 className="font-bold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: 'New order from John Doe', time: '2 hours ago' },
            { action: 'Support ticket from Jane Smith', time: '4 hours ago' },
            { action: 'New blog post published', time: '1 day ago' },
            { action: 'Commission completed for Mike Johnson', time: '2 days ago' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <p className="text-sm text-foreground">{item.action}</p>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TableSection({ title, items, columns }: { title: string; items: any[]; columns: string[] }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={`Search ${title.toLowerCase()}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="card-base overflow-hidden">
        <table className="w-full">
          <thead className="bg-accent-subtle border-b border-border">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  {col}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-border hover:bg-accent-subtle/30 transition-colors">
                {columns.map((col, j) => (
                  <td key={j} className="px-6 py-4 text-sm">
                    {item[col.toLowerCase().replace(' ', '_')] || '-'}
                  </td>
                ))}
                <td className="px-6 py-4 text-sm flex gap-2">
                  <button className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const mockArtworks = [
  { title: 'Anime Character Study', category: 'Anime', status: 'Published', views: '2,540' },
  { title: 'Realistic Portrait', category: 'Realistic', status: 'Published', views: '1,890' },
  { title: 'Modern Abstract', category: 'Modern', status: 'Draft', views: '0' },
];

const mockCategories = [
  { name: 'Anime', artworks: '12', status: 'Active' },
  { name: 'Realistic', artworks: '18', status: 'Active' },
  { name: 'Modern', artworks: '8', status: 'Active' },
];

const mockBlogPosts = [
  { title: 'Digital Illustration Techniques', author: 'SR Arts', status: 'Published', views: '456' },
  { title: 'My Artistic Journey', author: 'SR Arts', status: 'Draft', views: '0' },
];

const mockOrders = [
  { customer: 'John Doe', amount: '$250', status: 'Completed', date: 'Mar 15, 2024' },
  { customer: 'Jane Smith', amount: '$400', status: 'In Progress', date: 'Mar 14, 2024' },
];

const mockTickets = [
  { subject: 'Commission inquiry', status: 'Open', priority: 'High', date: 'Mar 20, 2024' },
  { subject: 'General feedback', status: 'Resolved', priority: 'Low', date: 'Mar 18, 2024' },
];
