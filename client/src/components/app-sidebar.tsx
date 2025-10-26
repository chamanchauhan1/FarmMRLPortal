import { Home, Users, Activity, FileText, Upload, LogOut, BarChart3 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const farmerMenuItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "My Farm", url: "/farm", icon: BarChart3 },
    { title: "Animals", url: "/animals", icon: Users },
    { title: "Treatment Records", url: "/treatments", icon: Activity },
    { title: "Reports", url: "/reports", icon: FileText },
    { title: "Upload Files", url: "/upload", icon: Upload },
  ];

  const inspectorMenuItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "All Farms", url: "/farms", icon: BarChart3 },
    { title: "All Animals", url: "/animals", icon: Users },
    { title: "Treatment Records", url: "/treatments", icon: Activity },
    { title: "Compliance Reports", url: "/reports", icon: FileText },
  ];

  const menuItems = user?.role === "farmer" ? farmerMenuItems : inspectorMenuItems;

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Activity className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold">Farm MRL</span>
            <span className="text-xs text-muted-foreground">Portal</span>
          </div>
        </div>
        {user && (
          <div className="mt-4 rounded-md bg-accent p-3">
            <p className="text-sm font-medium">{user.fullName}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <Badge className="mt-2" variant="outline" data-testid={`badge-role-${user.role}`}>
              {user.role === "farmer" ? "Farmer" : "Inspector"}
            </Badge>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={logout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
