"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export default function SetupPage() {
	return (
		<div className="container mx-auto p-8 max-w-4xl">
			<Card>
				<CardHeader>
					<CardTitle>Initial Setup Guide</CardTitle>
					<CardDescription>
						Follow these steps to create your first user and start using the system
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<Alert>
						<AlertTitle>Important</AlertTitle>
						<AlertDescription>
							You need to create users in Supabase Auth first, then sync them to your database.
						</AlertDescription>
					</Alert>

					<div className="space-y-4">
						<h3 className="text-xl font-semibold">Step 1: Create User in Supabase</h3>
						<ol className="list-decimal list-inside space-y-2 ml-4">
							<li>Go to your Supabase Dashboard</li>
							<li>Navigate to <strong>Authentication</strong> → <strong>Users</strong></li>
							<li>Click <strong>"Add User"</strong> → <strong>"Create new user"</strong></li>
							<li>Enter:
								<ul className="list-disc list-inside ml-6 mt-1">
									<li>Email: <code>admin@test.com</code> (or your email)</li>
									<li>Password: <code>Test1234!</code> (or your password)</li>
									<li>✅ Check <strong>"Auto Confirm User"</strong></li>
								</ul>
							</li>
							<li>Click <strong>"Create User"</strong></li>
							<li><strong>Copy the User UID</strong> (UUID) - you'll need this!</li>
						</ol>
					</div>

					<div className="space-y-4">
						<h3 className="text-xl font-semibold">Step 2: Create Hospital (Optional)</h3>
						<p className="text-muted-foreground">
							If you want to assign the user to a hospital, create one first:
						</p>
						<pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
{`-- Run this in your database
INSERT INTO hospital (name, address, contact_number)
VALUES ('Test Hospital', '123 Test St', '555-0100')
RETURNING hospital_id;`}
						</pre>
						<p className="text-sm text-muted-foreground">
							Note the <code>hospital_id</code> for Step 3
						</p>
					</div>

					<div className="space-y-4">
						<h3 className="text-xl font-semibold">Step 3: Sync User to Database</h3>
						<p className="text-muted-foreground">
							Run this SQL in your database (replace <code>USER_UUID</code> with the UUID from Step 1):
						</p>
						<pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
{`INSERT INTO users (user_id, name, email, role, hospital_id, permissions, is_active)
VALUES (
  'USER_UUID_FROM_SUPABASE',  -- Replace with UUID from Step 1
  'System Administrator',
  'admin@test.com',           -- Replace with your email
  'SysAdmin',
  NULL,                        -- Or hospital_id if you created one
  'view_dashboard,manage_users,manage_hospitals,manage_inventory,view_reports,invite_management,system_config',
  true
);`}
						</pre>
					</div>

					<div className="space-y-4">
						<h3 className="text-xl font-semibold">Step 4: Login</h3>
						<p className="text-muted-foreground">
							Once the user is created, you can login with the email and password you set in Supabase.
						</p>
						<Link href="/auth/login">
							<Button>Go to Login</Button>
						</Link>
					</div>

					<div className="space-y-4 pt-4 border-t">
						<h3 className="text-xl font-semibold">Creating More Users</h3>
						<p className="text-muted-foreground">
							After logging in as SysAdmin, you can:
						</p>
						<ul className="list-disc list-inside space-y-1 ml-4">
							<li>Go to <Link href="/test-invite" className="text-blue-400 underline">Test Invitations</Link></li>
							<li>Invite Management users</li>
							<li>Management users can then invite Doctors and Nurses</li>
						</ul>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

