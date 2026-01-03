
import { AdminDashboardLayout } from '@/components/admin-dashboard-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code } from 'lucide-react';

export default function DeveloperPage() {
  return (
    <AdminDashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>Developer Tools</CardTitle>
          <CardDescription>
            This is a placeholder for developer-specific tools and settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center p-12">
            <Code className="h-16 w-16 mb-4 text-muted-foreground" />
            <p className="font-semibold">Developer Tools Placeholder</p>
            <p className="text-sm text-muted-foreground">
                You can add components and functionality for developers here.
            </p>
        </CardContent>
      </Card>
    </AdminDashboardLayout>
  );
}
