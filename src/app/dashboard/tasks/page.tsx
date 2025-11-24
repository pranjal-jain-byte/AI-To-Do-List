import { tasks } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const priorityVariant = {
  Low: 'secondary',
  Medium: 'outline',
  High: 'default',
  Critical: 'destructive',
} as const;

const statusVariant = {
  todo: 'outline',
  in_progress: 'secondary',
  done: 'default',
};

function TaskToolbar() {
    return (
        <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold font-headline">My Tasks</h1>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Task
            </Button>
        </div>
    )
}

export default function TasksPage() {
  return (
    <div className="space-y-6">
        <TaskToolbar />
        <Card>
            <CardContent className="pt-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]">Task ID</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead className="w-[120px]">Status</TableHead>
                            <TableHead className="w-[120px]">Priority</TableHead>
                             <TableHead className="w-[180px]">Due Date</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.map((task) => (
                            <TableRow key={task.id}>
                                <TableCell className="font-medium text-muted-foreground">{task.id}</TableCell>
                                <TableCell className="font-semibold">{task.title}</TableCell>
                                <TableCell>
                                    <Badge variant={statusVariant[task.status] || 'default'}>{task.status.replace('_', ' ')}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={priorityVariant[task.priority] || 'default'}>{task.priority}</Badge>
                                </TableCell>
                                <TableCell>
                                    {new Date(task.dueDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                            <DropdownMenuItem>Mark as complete</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
